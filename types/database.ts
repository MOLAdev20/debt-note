// types/database.ts — tipe database Supabase (hand-written, biar query gak `any`)
//
// Kalau nanti schema berubah, file ini bisa di-regenerate dengan:
//   npx supabase gen types typescript --project-id <project-id> > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      debts: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["debt_type"];
          counterpart_name: string;
          amount: number;
          note: string | null;
          due_date: string | null;
          settled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["debt_type"];
          counterpart_name: string;
          amount: number;
          note?: string | null;
          due_date?: string | null;
          settled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database["public"]["Enums"]["debt_type"];
          counterpart_name?: string;
          amount?: number;
          note?: string | null;
          due_date?: string | null;
          settled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "debts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      debt_type: "owed_to_me" | "i_owe";
    };
    CompositeTypes: Record<never, never>;
  };
}
