// src/Paginas/Dashboard/StatsCards.tsx
// Tarjetas de estadísticas - Con datos reales

type DashboardStats = {
  totalClientes: number;
  clientesActivos: number;
  consumosHoy: number;
  consumosAyer: number;
  cambioConsumos: number;
  montoConsumosHoy: number;
  saldoTotalDisponible: number;
  saldoTotalAsignado: number;
  porcentajeSaldoUtilizado: number;
  totalProveedores: number;
  proveedoresActivos: number;
  totalEmpresas: number;
  empresasActivas: number;
} | null;

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

const StatsCards = ({ stats, loading = false }: StatsCardsProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `RD$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `RD$${(value / 1000).toFixed(1)}K`;
    }
    return `RD$${value.toLocaleString()}`;
  };

  const formatChange = (value: number) => {
    if (value > 0) return `+${value}%`;
    if (value < 0) return `${value}%`;
    return "0%";
  };

  // Skeleton loading
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Clientes",
      value: stats.totalClientes.toLocaleString(),
      subtitle: `${stats.clientesActivos} activos`,
      icon: "👥",
      bgLight: "bg-sky-50",
      change: null,
      changeType: "neutral" as const
    },
    {
      title: "Consumos Hoy",
      value: stats.consumosHoy.toLocaleString(),
      subtitle: formatCurrency(stats.montoConsumosHoy),
      icon: "📊",
      bgLight: "bg-emerald-50",
      change: stats.cambioConsumos,
      changeType: stats.cambioConsumos > 0 ? "up" as const : stats.cambioConsumos < 0 ? "down" as const : "neutral" as const
    },
    {
      title: "Empresas",
      value: (stats.totalEmpresas),
      subtitle: `${stats.empresasActivas} Activas`,
      icon: "🏢",
      bgLight: "bg-violet-50",
      change: null,
      changeType: "neutral" as const,
      //showProgress: true,
      progressValue: stats.porcentajeSaldoUtilizado
    },
    {
      title: "Proveedores",
      value: stats.totalProveedores.toString(),
      subtitle: `${stats.proveedoresActivos} activos`,
      icon: "🏪",
      bgLight: "bg-amber-50",
      change: null,
      changeType: "neutral" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              
              {/* Subtítulo o cambio */}
              <div className="mt-2 flex items-center gap-2">
                {card.change !== null ? (
                  <span className={`inline-flex items-center text-xs font-medium ${
                    card.changeType === "up" 
                      ? "text-green-600" 
                      : card.changeType === "down"
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}>
                    {card.changeType === "up" && "↑ "}
                    {card.changeType === "down" && "↓ "}
                    {formatChange(card.change)} vs ayer
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">{card.subtitle}</span>
                )}
              </div>

              {/* Barra de progreso opcional */}
              {card.showProgress && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      card.progressValue! >= 80 
                        ? "bg-red-500" 
                        : card.progressValue! >= 60 
                          ? "bg-amber-500" 
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(card.progressValue!, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            {/* Icono */}
            <div className={`w-12 h-12 rounded-xl ${card.bgLight} flex items-center justify-center`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;