interface Props {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
}

const inputStyle = {
  width: "100%", border: "1.5px solid #E5E7EB",
  borderRadius: 12, padding: "11px 14px",
  fontSize: 14, outline: "none",
  fontFamily: "inherit", background: "white",
  boxSizing: "border-box" as const,
};

export default function FormField({ label, value, onChange, type = "text", placeholder, required, as = "input", children }: Props) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>
        {label}{required && <span style={{ color: "#EF4444" }}> *</span>}
      </label>
      {as === "textarea" ? (
        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} />
      ) : as === "select" ? (
        <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
      ) : (
        <input style={inputStyle} type={type} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
