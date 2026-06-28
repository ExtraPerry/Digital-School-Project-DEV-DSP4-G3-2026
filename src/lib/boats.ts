import { Database } from "@/lib/supabase/database.types";

type BoatType = Database["public"]["Enums"]["boat_type"];

export const BOAT_TYPE_GRADIENTS: Record<BoatType, string> = {
  SAILBOAT: "from-[#8fb8d6] to-[#3f6f8f]",
  MOTORBOAT: "from-[#2c4870] to-[#16243d]",
  CATAMARAN: "from-[#cfd9e3] to-[#9fb3c4]",
  YACHT: "from-[#e3a98a] to-[#c9794f]",
};
