import { queryMany } from "@/lib/db";
import { format } from "date-fns";

export const metadata = { title: "Customers — Admin" };

interface CustomerRow {
  user_id: string;
  role: string;
  email: string;
  created_at: string;
}

export default async function AdminCustomersPage() {
  // Join user_roles and users to display user email
  const customers = await queryMany<CustomerRow>(
    `SELECT ur.user_id, ur.role, u.email, u.created_at 
     FROM user_roles ur
     JOIN users u ON u.id = ur.user_id
     WHERE ur.role = 'customer'
     ORDER BY u.created_at DESC
     LIMIT 100`
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="text-heading">Customers</h2>
        <p className="text-body mt-0.5">{customers.length} customers</p>
      </div>

      <div className="surface overflow-hidden">
        <table className="w-full text-[0.875rem]">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              {["User ID", "Email", "Role", "Joined"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-label font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, i) => (
              <tr
                key={customer.user_id}
                style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : undefined }}
                className="hover:bg-[var(--color-bg)] transition-base"
              >
                <td className="px-4 py-3">
                  <span className="text-mono">{customer.user_id.slice(0, 8)}…</span>
                </td>
                <td className="px-4 py-3 text-caption font-medium">{customer.email}</td>
                <td className="px-4 py-3 text-caption capitalize">{customer.role}</td>
                <td className="px-4 py-3 text-caption">
                  {format(new Date(customer.created_at), "d MMM yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="text-caption text-center py-8">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
