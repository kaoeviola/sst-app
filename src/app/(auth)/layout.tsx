export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="grid min-h-screen place-items-center bg-muted/30 px-4">{children}</main>;
}
