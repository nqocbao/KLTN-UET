import type { Request, Response } from "express";
import axios from "axios";
import Conversation from "../models/conversations.model.js";
import Message from "../models/messages.model.js";
import Tour from "../models/tours.model.js";
import Hotel from "../models/hotels.model.js";
import Transport from "../models/transports.model.js";
import Province from "../models/provinces.model.js";
import Country from "../models/countries.model.js";

const RASA_SERVER_URL = process.env.RASA_SERVER_URL || "http://localhost:5005";
const RASA_WEBHOOK_URL = `${RASA_SERVER_URL}/webhooks/rest/webhook`;

const VIETNAM_LOCATIONS: string[] = [
  "hà nội", "ha noi", "hanoi",
  "hồ chí minh", "ho chi minh", "sài gòn", "sai gon", "tphcm", "tp.hcm", "tp hcm",
  "đà nẵng", "da nang", "danang",
  "nha trang", "phú quốc", "phu quoc",
  "đà lạt", "da lat", "dalat",
  "hội an", "hoi an", "sapa", "sa pa",
  "huế", "hue", "cần thơ", "can tho",
  "hải phòng", "hai phong",
  "quảng ninh", "quang ninh", "hạ long", "ha long",
  "ninh bình", "ninh binh",
  "phan thiết", "phan thiet", "mũi né", "mui ne",
  "quy nhơn", "quy nhon", "vũng tàu", "vung tau",
  "buôn ma thuột", "buon ma thuot", "pleiku", "kon tum",
  "vinh", "thanh hóa", "thanh hoa",
  "quảng bình", "quảng trị",
  "phan rang", "ninh thuận",
  "bình thuận", "bình dương", "đồng nai",
  "cà mau", "kiên giang", "bạc liêu",
  "long an", "tiền giang", "bến tre", "vĩnh long",
  "an giang", "đồng tháp",
  // International
  "bangkok", "thái lan", "thai lan", "thailand",
  "nhật bản", "nhat ban", "japan", "tokyo",
  "hàn quốc", "han quoc", "korea", "seoul",
  "singapore", "bali", "paris", "dubai",
];

function extractLocationFromText(text: string): string | null {
  const lower = text.toLowerCase();
  const patterns = [
    /(?:ở|tại|đến|đi|về)\s+([\p{L}\s]+?)(?:\s*$|\s+(?:không|nhé|nha|đó|ạ|này|có|được|trong|khoảng|với))/u,
    /(?:du lịch|tham quan|khám phá)\s+([\p{L}\s]+?)(?:\s*$|\s+)/u,
  ];
  for (const pat of patterns) {
    const m = lower.match(pat);
    if (m) {
      const candidate = (m[1] ?? "").trim();
      for (const loc of VIETNAM_LOCATIONS) {
        if (loc.includes(candidate) || candidate.includes(loc)) {
          return loc.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
      }
    }
  }
  for (const loc of VIETNAM_LOCATIONS) {
    if (lower.includes(loc)) {
      return loc.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
  }
  return null;
}

function parseDurationFromText(text: string): number | undefined {
  const m =
    text.match(/(\d+)\s*(?:ngày|day)/i) ||
    text.match(/(\d+)\s*(?:đêm|night)/i) ||
    text.match(/(\d+)\s*(?:tuần|week)/i);
  if (m) {
    const n = parseInt(m[1] ?? "0");
    if (text.match(/tuần|week/i)) return n * 7;
    return n;
  }
  return undefined;
}

function parseGuestsFromText(text: string): number | undefined {
  const m = text.match(/(\d+)\s*(?:người|khách|adult|person)/i);
  if (m) return parseInt(m[1] ?? "2");
  if (/gia đình|family/i.test(text)) return 4;
  return undefined;
}

function parseBudgetFromText(text: string): string | undefined {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|million|vnđ)/i);
  if (m) return `${m[1]} triệu VNĐ`;
  return undefined;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const val = price / 1_000_000;
    return `${val % 1 === 0 ? val : val.toFixed(1)} triệu`;
  }
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
  return price.toString();
}

export const getItineraryRecommendation = async (req: Request, res: Response) => {
  try {
    const { message, sender } = req.body;
    if (!message) {
      return res.status(400).json({ text: "Vui lòng nhập nội dung." });
    }

    let destination: string | null = null;
    let rasaEntities: Record<string, string> = {};

    try {
      const nluRes = await axios.post(
        `${RASA_SERVER_URL}/model/parse`,
        { text: message },
        { timeout: 4000 }
      );
      const entities: { entity: string; value: string }[] = nluRes.data?.entities || [];
      for (const e of entities) {
        rasaEntities[e.entity] = e.value;
      }
      destination =
        rasaEntities["destination"] ||
        rasaEntities["location"] ||
        rasaEntities["flight_to"] ||
        null;
    } catch {
      // fallback to regex
    }

    if (!destination) {
      destination = extractLocationFromText(message);
    }

    const durationDays =
      parseDurationFromText(message) ??
      (rasaEntities["duration"] ? parseInt(rasaEntities["duration"]) : undefined);
    const guests = parseGuestsFromText(message);
    const budget = parseBudgetFromText(message);
    const flightFrom = rasaEntities["flight_from"] || extractDepartureFromText(message);

    if (!destination) {
      return res.json({
        text: "Bạn muốn đi đâu? Hãy cho tôi biết điểm đến (ví dụ: Đà Nẵng, Phú Quốc, Nha Trang, Nhật Bản...) để tôi có thể gợi ý lịch trình phù hợp nhé! 🗺️",
        trip_package: null,
      });
    }

    const locationRegex = { $regex: destination, $options: "i" };
    const tourFilter: any = {
      status: "active",
      $or: [{ name: locationRegex }, { description: locationRegex }],
    };
    if (durationDays) {
      tourFilter.duration_days = { $gte: durationDays - 1, $lte: durationDays + 1 };
    }

    const [tours, hotels, flights] = await Promise.all([
      Tour.find(tourFilter)
        .populate("country_id", "name")
        .populate("guide_id", "name experience")
        .populate("included_services", "name icon")
        .sort({ rating: -1 })
        .limit(3)
        .lean(),

      Hotel.find({ location: locationRegex })
        .sort({ rating: -1 })
        .limit(3)
        .lean(),

      Transport.find({
        type: "flight",
        is_active: true,
        $or: [
          { arrival_location: locationRegex },
          { departure_location: locationRegex },
        ],
      })
        .sort({ price: 1 })
        .limit(3)
        .lean(),
    ]);

    let finalTours = tours;
    if (finalTours.length === 0) {
      const [country, province] = await Promise.all([
        Country.findOne({ name: locationRegex }).lean(),
        Province.findOne({ name: locationRegex }).lean(),
      ]);
      if (country) {
        finalTours = await Tour.find({ status: "active", country_id: (country as any)._id })
          .populate("country_id", "name")
          .populate("guide_id", "name experience")
          .populate("included_services", "name icon")
          .sort({ rating: -1 })
          .limit(3)
          .lean();
      } else if (province) {
        finalTours = await Tour.find({
          status: "active",
          $or: [
            { name: locationRegex },
            { departure_location_id: (province as any)._id },
          ],
        })
          .populate("country_id", "name")
          .populate("guide_id", "name experience")
          .populate("included_services", "name icon")
          .sort({ rating: -1 })
          .limit(3)
          .lean();
      }
    }

    const formattedTours = finalTours.map((t: any) => ({
      name: t.name,
      tour_code: t.tour_code,
      image_url: (Array.isArray(t.images) ? t.images[0] : null) || t.banner_url,
      rating: t.rating,
      duration: t.duration_days,
      price_text: t.adult_price ? formatPrice(t.adult_price) : undefined,
      departure_dates: (t.departure_dates || [])
        .map((d: Date) => d.toISOString())
        .slice(0, 3),
      description: t.description?.slice(0, 120),
      included_transport: t.included_services_detail?.transport || null,
      included_accommodation: t.included_services_detail?.accommodation || null,
    }));

    const formattedHotels = hotels.map((h: any) => ({
      name: h.name,
      image_url: h.image_url || h.banner_url,
      rating: h.rating,
      price_text: h.priceTwoSingleBed ? formatPrice(h.priceTwoSingleBed) : undefined,
      available_rooms: h.availableRooms,
    }));

    const formattedFlights = flights.map((f: any) => ({
      name: f.service_name,
      airline: f.vehicle_type,
      departure: f.departure_location,
      arrival: f.arrival_location,
      dep_time: f.departure_time,
      arr_time: f.arrival_time,
      duration_text: f.duration,
      price_text: f.price ? formatPrice(f.price) : undefined,
      stops: f.stops,
    }));

    const itinerary =
      finalTours[0] && (finalTours[0] as any).itinerary?.length > 0
        ? (finalTours[0] as any).itinerary.slice(0, 5)
        : undefined;

    let totalEstimate: string | undefined;
    const tourPrice = finalTours[0] ? (finalTours[0] as any).adult_price : 0;
    const flightPrice = flights[0] ? (flights[0] as any).price : 0;
    const hotelPricePerNight = hotels[0]
      ? (hotels[0] as any).priceTwoSingleBed ?? (hotels[0] as any).priceOneSingleOneDoubleBed ?? 0
      : 0;
    const nights = (durationDays ?? 3) - 1;
    const tourIncludesAccommodation = !!(finalTours[0] as any)?.included_services_detail?.accommodation;
    const tourIncludesTransport = !!(finalTours[0] as any)?.included_services_detail?.transport;

    if (tourPrice > 0 || flightPrice > 0 || hotelPricePerNight > 0) {
      const total =
        (tourPrice || 0) +
        (tourIncludesTransport ? 0 : flightPrice || 0) +
        (tourIncludesAccommodation ? 0 : hotelPricePerNight * nights);
      if (total > 0) totalEstimate = `~${formatPrice(total)}`;
    }

    const hasTours = formattedTours.length > 0;
    const hasHotels = formattedHotels.length > 0;
    const hasFlights = formattedFlights.length > 0;

    const intro = hasTours
      ? `Tôi đã tìm thấy một số lựa chọn cho chuyến đi **${destination}** của bạn:`
      : `Đây là thông tin tham khảo cho chuyến đi **${destination}**:`;

    const tripPackage = {
      destination,
      duration_days: durationDays,
      guests,
      budget,
      tours: formattedTours,
      flights: formattedFlights,
      hotels: formattedHotels,
      itinerary,
      total_estimate: totalEstimate,
    };
    console.log(formattedTours, "  ", formattedHotels, " ", formattedFlights)

    if (!hasTours && !hasHotels && !hasFlights) {
      return res.json({
        text: `Xin lỗi, hiện tại hệ thống chưa có dữ liệu cho **${destination}**. Bạn thử các điểm đến phổ biến như Đà Nẵng, Phú Quốc, Nha Trang, Đà Lạt nhé! 🙏`,
        trip_package: null,
      });
    }

    return res.json({ text: intro, trip_package: tripPackage });
  } catch (error: any) {
    console.error("[recommend] Error:", error.message);
    res.status(500).json({
      text: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.",
      trip_package: null,
    });
  }
};

function extractDepartureFromText(text: string): string | undefined {
  const m = text.match(/(?:từ|from)\s+([\p{L}\s]+?)(?:\s+(?:đến|to|đi)|$)/iu);
  if (m) return (m[1] ?? "").trim() || undefined;
  return undefined;
}

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    
    const conversation = new Conversation({
      user_id: user_id || null,
      started_at: new Date(),
    });
    
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

export const getConversations = async (_req: Request, res: Response) => {
  try {
    const allConversations = await Conversation.find()
      .populate("user_id")
      .sort({ started_at: -1 })
      .limit(100);
    res.json(allConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findById(id).populate("user_id");
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    const messages = await Message.find({ conversation_id: id })
      .sort({ created_at: 1 });
    
    res.json({ ...conversation.toJSON(), messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export const endConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { ended_at: new Date() },
      { new: true }
    );
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
   
    res.json(conversation);
  } catch (error) {
    console.error("Error ending conversation:", error);
    res.status(500).json({ error: "Failed to end conversation" });
  }
};

export const sendMessageToRasa = async (req: Request, res: Response) => {
  try {
    const { message, sender, conversation_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const senderId = sender || `user_${Date.now()}`;
    let resolvedConversationId = conversation_id;

    if (!resolvedConversationId) {
      const conversation = await Conversation.create({
        started_at: new Date(),
      });
      resolvedConversationId = conversation._id;
    }

    const userMessage = new Message({
      conversation_id: resolvedConversationId,
      sender: "user",
      content: message,
    });
    await userMessage.save();

    const rasaResponse = await axios.post(
      RASA_WEBHOOK_URL,
      {
        sender: senderId,
        message: message,
      },
      {
        timeout: 60000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const botResponses = rasaResponse.data;

    if (Array.isArray(botResponses)) {
      for (const response of botResponses) {
        const botMessage = new Message({
          conversation_id: resolvedConversationId,
          sender: "bot",
          content: response.text || response.custom?.text || "",
        });
        await botMessage.save();
      }
    }

    res.json(botResponses);
  } catch (error: any) {
    console.error("Error communicating with RASA:", error.message);
    
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        error: "RASA server is not available. Please make sure RASA is running.",
        details: "Run: cd chatbot && rasa run --enable-api --cors '*'",
      });
    }

    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
};
