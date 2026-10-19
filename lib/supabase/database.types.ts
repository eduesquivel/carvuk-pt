// Tipos escritos a mano según el esquema actual del proyecto en Supabase.
// Se pueden regenerar con: npx supabase gen types typescript --linked
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          created_at: string;
          name: string | null;
          unit_price: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name?: string | null;
          unit_price?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string | null;
          unit_price?: number | null;
        };
        Relationships: [];
      };
      receipt: {
        Row: {
          id: number;
          created_at: string;
          user_id: string | null;
          gross_value: number | null;
          tax: number | null;
          net_value: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          gross_value?: number | null;
          tax?: number | null;
          net_value?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          gross_value?: number | null;
          tax?: number | null;
          net_value?: number | null;
        };
        Relationships: [];
      };
      carts: {
        Row: {
          id: number;
          created_at: string;
          product_id: number | null;
          receipt_id: number | null;
          quantity: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          product_id?: number | null;
          receipt_id?: number | null;
          quantity?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          product_id?: number | null;
          receipt_id?: number | null;
          quantity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "carts_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "carts_receipt_id_fkey";
            columns: ["receipt_id"];
            isOneToOne: false;
            referencedRelation: "receipt";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Receipt = Database["public"]["Tables"]["receipt"]["Row"];
