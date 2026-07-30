    "use client";

    import { useCallback, useEffect, useState } from "react";
    import AdminLayout from "../../../components/layout/AdminLayout";
    import AdminToast from "../../../components/ui/AdminToast";
    import RatingStars from "../../../components/product/RatingStars";
    import { api } from "../../../lib/api";

    function formatDate(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    }

    function StatusBadge({ status }) {
    const isApproved = status === "approved";
    return (
        <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
            isApproved
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
        }`}
        >
        <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-green-400" : "bg-yellow-400"}`} />
        {isApproved ? "Approved" : "Pending"}
        </span>
    );
    }

    function LoadingSkeleton() {
    return Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-t border-stone-800/60">
        {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-4">
            <div className="h-3 rounded-full bg-stone-800 animate-pulse" style={{ width: `${55 + ((i * j) % 35)}%` }} />
            </td>
        ))}
        </tr>
    ));
    }

    function ReviewRow({  item, 
    onApprove, 
    onStatusChange,
    onEdit,
    isUpdating,
    permissions 
}) {
    return (
        <tr className="border-t border-stone-800/60 transition-colors hover:bg-[#1b1630]">
        <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#161022] border border-stone-800">
                {item.productImage ? (
                <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                ) : null}
            </div>
            <span className="text-stone-200 text-sm">{item.productName}</span>
            </div>
        </td>
        <td className="px-4 py-3.5 text-stone-300 text-xs">{item.customerName}</td>
        <td className="px-4 py-3.5">
            <RatingStars value={item.rating} size="sm" />
        </td>
        <td className="px-4 py-3.5 max-w-[260px]">
            <p className="text-stone-400 text-xs line-clamp-2 break-words">{item.review}</p>
        </td>
        <td className="px-4 py-3.5 text-xs text-stone-500 tabular-nums">{formatDate(item.submittedAt)}</td>
        <td className="px-4 py-3.5">
            <StatusBadge status={item.status} />
        </td>
      <td className="px-4 py-3.5">
    <div className="flex items-center gap-2">

        {/* Approve / Change Status */}
        {permissions.canChangeStatus && (
            <button
                onClick={() => 
                    onStatusChange(
                        item.id,
                        item.status === "approved" 
                            ? "pending" 
                            : "approved"
                    )
                }
                disabled={isUpdating}
                className="
                    px-4 py-2 rounded-lg
                    bg-[#b48a3c]
                    text-[#0f0a1a]
                    text-xs font-bold uppercase
                    hover:bg-[#d4af37]
                    transition-all
                    cursor-pointer
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                "
            >
                {isUpdating
                    ? "Updating..."
                    : item.status === "approved"
                        ? "Unapprove"
                        : "Approve"
                }
            </button>
        )}


        {/* Edit */}
        {permissions.canEdit && (
            <button
                onClick={() => onEdit(item)}
                className="
                    px-3 py-2 rounded-lg
                    border border-stone-700
                    text-stone-300
                    text-xs
                    hover:border-[#b48a3c]
                    hover:text-[#b48a3c]
                    transition-colors
                    cursor-pointer
                "
            >
                Edit
            </button>
        )}

    </div>
</td>
        </tr>
    );
    }

  function EditReviewModal({ review, onClose, onSave }) {
    const [text, setText] = useState(review.review || "");
    const [rating, setRating] = useState(review.rating || 1);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        try {
            setSaving(true);

            const response = await api.products.reviews.update(
                review.id,
                {
                    rating,
                    review: text.trim(),
                }
            );

            const updated = response?.data || response;

            onSave(updated);

        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/60 backdrop-blur-sm
        ">

            <div className="
                w-full max-w-md
                rounded-2xl
                border border-stone-800
                bg-[#0c0816]
                p-6
                shadow-2xl
            ">

                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-white">
                        Edit Review
                    </h2>

                    <button
                        onClick={onClose}
                        className="
                            text-stone-400
                            hover:text-white
                            cursor-pointer
                        "
                    >
                        ✕
                    </button>
                </div>


                <div className="space-y-2">

   <label className="block text-sm font-medium text-stone-300">
        Rating
    </label>

    <div className="flex items-center gap-3">
        <RatingStars
            value={rating}
            onChange={setRating}
            interactive
            size="lg"
        />

        <span className="text-sm font-medium text-[#d4af37]">
            {rating}/5
        </span>
    </div>

    <div className="space-y-2">
    <label className="block text-sm font-medium text-stone-300">
        Review
    </label>

    <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="
            w-full
            rounded-xl
            border
            border-stone-700
            bg-[#161022]
            px-4
            py-3
            text-white
            placeholder:text-stone-500
            focus:outline-none
            focus:border-[#d4af37]
            resize-none
        "
    />
</div>

    <div className="flex justify-end gap-3 pt-2">
    <button
        onClick={onClose}
        className="
            px-5 py-2
            rounded-lg
            border border-stone-700
            text-stone-300
            hover:bg-stone-800
            transition
            cursor-pointer
        "
    >
        Cancel
    </button>

    <button
        onClick={handleSubmit}
        disabled={saving}
        className="
            px-5 py-2
            rounded-lg
            bg-[#b48a3c]
            text-[#0f0a1a]
            font-semibold
            hover:bg-[#d4af37]
            transition
            cursor-pointer
            disabled:opacity-50
            disabled:cursor-not-allowed
        "
    >
        {saving ? "Saving..." : "Save Changes"}
    </button>
</div>

</div>

            </div>

        </div>
    );
}

    function AdminReviewsContent() {
    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("pending");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState({ open: false, message: "", type: "success" });
    const [selectedReview, setSelectedReview] = useState(null);
const [editModalOpen, setEditModalOpen] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
        const params = { page, limit: 20 };
        if (statusFilter !== "all") params.status = statusFilter;
        if (search.trim()) params.search = search.trim();

       const res = await api.products.reviews.adminList(params);

const payload = res?.data || res;

const formattedRows = (payload?.reviews || []).map((item) => ({
    id: item.id,

    productName: item.product?.name || "Unknown Product",

    productImage: item.product?.image || null,

    customerName: item.customer?.name || "Unknown Customer",

    rating: item.rating,

    review: item.review,

    submittedAt: item.createdAt,

    status: item.approved ? "approved" : "pending",
}));

setRows(formattedRows);

setPagination(
    payload?.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
    }
);
        } catch (err) {
        setError(err?.message || "Failed to load reviews");
        } finally {
        setLoading(false);
        }
    }, [page, statusFilter, search]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
        setPage(1);
        setSearch(searchInput);
        }, 350);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const handleApprove = async (reviewId) => {
        if (updatingId) return;
        setUpdatingId(reviewId);

        const snapshot = rows;
        setRows((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: "approved" } : r)));

        try {
        await api.products.reviews.approve(reviewId);
        setToast({ open: true, message: "Review approved", type: "success" });
        } catch (err) {
        setRows(snapshot);
        setToast({ open: true, message: err?.message || "Failed to approve review", type: "error" });
        } finally {
        setUpdatingId(null);
        }
    };

 const handleStatusChange = async (reviewId,status)=>{

    if(updatingId) return;

    setUpdatingId(reviewId);

    try{

     await api.products.reviews.updateStatus(reviewId, {
    approved: status === "approved",
});


        setRows(prev =>
            prev.map(item =>
                item.id === reviewId
                ? {
                    ...item,
                    status
                }
                : item
            )
        );


        setToast({
            open:true,
            message:
            status==="approved"
            ? "Review approved"
            : "Review unpublished",
            type:"success"
        });


    }catch(error){

        setToast({
            open:true,
            message:error.message || "Failed",
            type:"error"
        });

    }finally{
        setUpdatingId(null);
    }

}

const handleEdit = (review) => {
    console.log("Editing review:", review);

    // open modal or navigate to edit page
    setSelectedReview(review);
    setEditModalOpen(true);
};

    const permissions = {
    canChangeStatus: true,
    canEdit: true,
};

    return (
        <div className="space-y-8">
        <AdminToast
            open={toast.open}
            type={toast.type}
            message={toast.message}
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        />

        <div className="space-y-6 rounded-3xl border border-stone-800 bg-[#0c0816] p-6 shadow-sm">
            <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Review Management</h1>
            <p className="mt-2 text-sm text-stone-400">Moderate customer product reviews</p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1">
                <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by product or customer..."
                className="w-full rounded-lg border border-stone-800 bg-[#161022] px-4 py-3 text-sm text-white placeholder-stone-500 shadow-sm transition focus:border-[#b48a3c] focus:outline-none focus:ring-2 focus:ring-[#b48a3c]"
                />
            </div>

            <select
                value={statusFilter}
                onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
                }}
                className="bg-[#161022] border border-stone-800 rounded-lg px-3 py-3 text-sm text-stone-300 focus:outline-none focus:border-[#b48a3c] cursor-pointer"
            >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
            </select>
            </div>
        </div>

        {error ? (
            <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-4 text-sm text-red-400 shadow-sm">
            {error}
            </div>
        ) : null}

        <div className="rounded-2xl border border-stone-800 overflow-hidden shadow-xl shadow-black/30">
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                <tr className="bg-[#13101f] border-b border-stone-800">
                    {["Product", "Customer", "Rating", "Review", "Submitted", "Status", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-[2px] uppercase text-stone-500">
                        {h}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <LoadingSkeleton />
                ) : rows.length === 0 ? (
                    <tr>
                    <td colSpan={7} className="py-20 text-center text-stone-600 text-sm">
                        No reviews found
                    </td>
                    </tr>
                ) : (
                    rows.map((item) => (
                   <ReviewRow
    key={item.id}
    item={item}
    onApprove={handleApprove}
    onStatusChange={handleStatusChange}
    onEdit={handleEdit}
    isUpdating={updatingId === item.id}
    permissions={permissions}
/>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>

        {!loading && rows.length > 0 && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} reviews
            </p>
            <div className="flex gap-1.5">
                <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-medium border border-stone-800 text-stone-400 hover:border-stone-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                ←
                </button>
                <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-medium border border-stone-800 text-stone-400 hover:border-stone-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                →
                </button>
            </div>
            </div>
        ) : null}

        {editModalOpen && selectedReview && (
    <EditReviewModal
        review={selectedReview}
        onClose={() => {
            setEditModalOpen(false);
            setSelectedReview(null);
        }}
      onSave={(updatedReview)=>{

setRows(prev =>
prev.map(item =>
item.id===updatedReview.id
?
{
 ...item,
 rating:updatedReview.rating,
 review:updatedReview.review
}
:
item
)
);


setEditModalOpen(false);
setSelectedReview(null);

}}
    />
)}
        </div>
    );
    }

    export default function AdminReviewsPage() {
    return (
        <AdminLayout>
        <AdminReviewsContent />
        </AdminLayout>
    );
    }