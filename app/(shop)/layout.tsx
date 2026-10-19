import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { CartLink } from "@/components/cart/cart-link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-b-foreground/10">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 text-sm">
          <div className="flex items-center gap-6">
            <Link href="/products" className="font-bold">
              🛒 Carrito Feliz
            </Link>
            <Link href="/products" className="hover:underline">
              Catálogo
            </Link>
            <CartLink />
            <Link href="/receipts" className="hover:underline">
              Boletas
            </Link>
          </div>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-5xl flex-1 p-5">
        <Suspense fallback={<p className="text-muted-foreground">Cargando...</p>}>
          {children}
        </Suspense>
      </main>
      <footer className="flex items-center justify-center gap-8 border-t py-8 text-xs">
        <p>Carrito Feliz · Powered by Supabase</p>
        <ThemeSwitcher />
      </footer>
    </div>
  );
}
