export default function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-10 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3 text-right"><div className="h-8 w-28 bg-gray-200 rounded" /></td>
    </tr>
  );
}