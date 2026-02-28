type Color = "blue" | "purple" | "green" | "orange";

type Props = {
  title: string;
  value: string | number;
  color: Color;
};

export default function StatCard({ title, value, color }: Props) {
  const colors: Record<Color, string> = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <p className="text-gray-500 text-sm mb-2">{title}</p>

      <p className={`text-3xl font-bold px-3 py-1 rounded ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}