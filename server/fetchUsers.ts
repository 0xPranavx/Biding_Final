 import { supabase } from "@/lib/supabaseClient";
 
 export const fetchUsers = async () => {
      
      const { data, error } = await supabase
        .from("users")
        .select("*");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        return data;
      }
      
    };