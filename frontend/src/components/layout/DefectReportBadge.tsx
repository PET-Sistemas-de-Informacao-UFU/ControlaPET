import { useDefectReportSummary } from "../../hooks/useDefectReport";

export default function DefectReportBadge() {
    const { data, isError } = useDefectReportSummary();
    const count = data?.open ?? 0;
    if (isError || count === 0) return null;
    return <span className="defect-nav-count" aria-label={`${count} relatos aguardando avaliação`} title={`${count} relatos aguardando avaliação`}>{count > 99 ? "99+" : count}</span>;
}
