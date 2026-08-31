import { queryOne, queryMany } from "@/lib/db";

export const metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  const cards = await queryMany<{ status: string }>(
    "SELECT status FROM cards"
  );

  const customerCountRes = await queryOne<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM user_roles WHERE role = 'customer'"
  );

  const stats = [
    { label: "Total Cards", value: cards.length },
    { label: "Active Cards", value: cards.filter((c) => c.status === "active").length },
    { label: "Inactive Cards", value: cards.filter((c) => c.status === "inactive").length },
    { label: "Customers", value: parseInt(customerCountRes?.count ?? "0", 10) },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-heading">Admin Overview</h2>
        <p className="text-body mt-0.5">System-wide statistics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="surface p-4">
            <p className="text-caption mb-1">{stat.label}</p>
            <p className="text-[1.5rem] font-semibold" style={{ color: "var(--color-fg)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
