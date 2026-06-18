import type { Transaction } from '@/types';

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: '💳 T. Crédito',
  BANK_TRANSFER: '🏦 Transferencia',
  YAPE_PLIN: '📱 Yape/Plin',
};

interface TransactionsTableProps {
  transactions: Transaction[];
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
      <div className="text-[13px] font-semibold text-text-muted mb-0.5">Transacciones recientes</div>
      <div className="text-[11px] text-text-ghost mb-4">Últimas 5 operaciones registradas en la plataforma</div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '26%' }} />
          </colgroup>
          <thead>
            <tr>
              {['ID', 'Cliente', 'Tipo', 'Monto', 'Fecha', 'Medio de Pago'].map((h) => (
                <th
                  key={h}
                  className="text-left text-text-ghost font-medium px-2.5 py-2 border-b border-border-subtle text-[10.5px] uppercase tracking-[0.05em] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-2.5 py-2.5 border-b border-border-muted text-text-ghost text-[10.5px]">
                  #{t.id.slice(-4).toUpperCase()}
                </td>
                <td className="px-2.5 py-2.5 border-b border-border-muted text-text-secondary font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                  {t.clientName}
                </td>
                <td className="px-2.5 py-2.5 border-b border-border-muted">
                  <span
                    className="rounded-pill px-2 py-0.5 text-[10.5px] font-semibold border"
                    style={
                      t.type === 'LEAD'
                        ? { background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', borderColor: 'rgba(20,184,166,0.3)' }
                        : { background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }
                    }
                  >
                    {t.type === 'LEAD' ? 'Lead' : 'Suscripción'}
                  </span>
                </td>
                <td className="px-2.5 py-2.5 border-b border-border-muted font-bold text-text-primary tabular-nums whitespace-nowrap">
                  S/ {t.amountSOL.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-2.5 py-2.5 border-b border-border-muted text-text-faint text-[11px]">
                  {new Date(t.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-2.5 py-2.5 border-b border-border-muted text-text-muted text-[11px]">
                  {PAYMENT_LABELS[t.paymentMethod] ?? t.paymentMethod}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
