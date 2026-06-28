import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";

interface ServiceCategory {
  id: number | string;
  categoryName: string;
  icon?: string;
  description?: string;
}

interface Service {
  id: number | string;
  name: string;
  description?: string;
  storeName?: string;
  phone?: string;
  telegramUsername?: string;
  categoryId?: number | string;
  imageUrl?: string;
  imageId?: string;
}

// Kategoriya nomiga qarab fallback emoji
const ICON_MAP: Record<string, string> = {
  elektrik: "⚡", electrician: "⚡",
  santexnik: "🔧", plumber: "🔧",
  usta: "🪚", builder: "🪚",
  farrosh: "🧹", cleaner: "🧹",
  haydovchi: "🚗", driver: "🚗",
  bogbon: "🌿", gardener: "🌿",
};

function resolveCatIcon(name: string | undefined, icon?: string): string {
  if (icon) return icon;
  const key = (name ?? "").toLowerCase().replace(/[^a-z]/g, "");
  return ICON_MAP[key] ?? "🔧";
}

function imgUrl(service: Service): string | null {
  if (service.imageUrl && service.imageUrl.startsWith("https://")) return service.imageUrl;
  if (!service.imageId) return null;
  return `${FILE_URL}/${service.imageId}`;
}

function cleanPhone(phone: string): string {
  return phone.replace(/\s+/g, "");
}
function cleanTg(username: string): string {
  return username.replace(/^@/, "");
}

type ContactSheet = { service: Service } | null;

export default function ServiceProvidersPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const nav = useNavigate();

  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [contactSheet, setContactSheet] = useState<ContactSheet>(null);

  useEffect(() => {
    if (!categoryId) return;

    // Kategoriya ma'lumotini olish (nom va icon uchun)
    api.get<ServiceCategory>(`/ServiceCategory/GetById/${categoryId}`)
      .then((r) => setCategory((r.data as any)?.data ?? r.data))
      .catch(() => setCategory(null));

    // Kategoriyaga tegishli servicelar
    api.get<Service[]>(`/Service/GetAll?categoryId=${categoryId}`)
      .then((r) => setServices((r.data as any)?.data ?? r.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const catIcon = category ? resolveCatIcon(category.categoryName, category.icon) : "🔧";
  const catName = category?.categoryName ?? "Xizmatlar";
  const hasContact = (s: Service) => !!(s.phone || s.telegramUsername);

  return (
    <>
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={() => nav("/services")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="page-title">{catIcon} {catName}</div>
        </div>

        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div className="empty-state"><span className="ei">⏳</span><p>Yuklanmoqda...</p></div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <span className="ei">{catIcon}</span>
              <p>Bu kategoriyada xizmat topilmadi</p>
            </div>
          ) : (
            services.map((s) => (
              <div key={s.id} className="provider-card">
                <div className="provider-avatar" style={{ overflow: "hidden" }}>
                  {(() => {
                    const url = imgUrl(s);
                    return url && !imgErrors.has(String(s.id))
                      ? <img src={url} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErrors((p) => new Set(p).add(String(s.id)))} />
                      : <span>{catIcon}</span>
                  })()}
                </div>

                <div className="provider-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="pname" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.name}
                  </div>
                  {s.description && (
                    <div className="pdesc" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.description}
                    </div>
                  )}
                </div>

                {hasContact(s) ? (
                  <button
                    onClick={() => setContactSheet({ service: s })}
                    style={{
                      flexShrink: 0, padding: "8px 14px", borderRadius: 12,
                      border: "none", background: "#2563EB", color: "white",
                      fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    Bog'lanish
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact bottom sheet */}
      {contactSheet && (
        <div className="modal-overlay" onClick={() => setContactSheet(null)}>
          <div
            className="modal-sheet"
            style={{ maxWidth: 480, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />

            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
              {contactSheet.service.name}
            </div>
            {contactSheet.service.description && (
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                {contactSheet.service.description}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {contactSheet.service.phone && (
                <a
                  href={`tel:${cleanPhone(contactSheet.service.phone)}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 14,
                    background: "#EFF6FF", textDecoration: "none",
                    color: "#1d4ed8", fontWeight: 600, fontSize: 15,
                  }}
                >
                  <span style={{ fontSize: 22 }}>📞</span>
                  <span>{contactSheet.service.phone}</span>
                </a>
              )}

              {contactSheet.service.telegramUsername && (
                <a
                  href={`https://t.me/${cleanTg(contactSheet.service.telegramUsername)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 14,
                    background: "#EFF6FF", textDecoration: "none",
                    color: "#1d4ed8", fontWeight: 600, fontSize: 15,
                  }}
                >
                  <span style={{ fontSize: 22 }}>✈️</span>
                  <span>@{cleanTg(contactSheet.service.telegramUsername)}</span>
                </a>
              )}

              <button
                onClick={() => setContactSheet(null)}
                style={{
                  marginTop: 4, padding: "13px", borderRadius: 14,
                  border: "1.5px solid #E5E7EB", background: "white",
                  color: "#6B7280", fontWeight: 600, fontSize: 15, cursor: "pointer",
                }}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
