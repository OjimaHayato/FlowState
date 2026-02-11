"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Check, ChevronsUpDown, Plus, X, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
    id: number;
    name: string;
    color_code: string;
};

type CategorySelectProps = {
    selectedId: number | null;
    onSelect: (id: number | null) => void;
};

const COLORS = [
    "#6366f1", // Indigo
    "#ef4444", // Red
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Violet
    "#3b82f6", // Blue
    "#14b8a6", // Teal
];

export default function CategorySelect({ selectedId, onSelect, showAllOption = false, placeholder = "Select Category", disableCreate = false }: CategorySelectProps & { showAllOption?: boolean, placeholder?: string, disableCreate?: boolean }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"list" | "create" | "edit">("list");

    // Form State
    const [categoryName, setCategoryName] = useState("");
    const [categoryColor, setCategoryColor] = useState(COLORS[0]);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories/");
            setCategories(res.data);
            if (selectedId === null && res.data.length > 0 && !showAllOption) {
                onSelect(res.data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const resetForm = () => {
        setCategoryName("");
        setCategoryColor(COLORS[0]);
        setEditingId(null);
        setMode("list");
    };

    const handleCreate = async () => {
        if (!categoryName.trim()) return;
        try {
            const res = await api.post("/categories/", {
                name: categoryName,
                color_code: categoryColor
            });
            setCategories([...categories, res.data]);
            onSelect(res.data.id);
            resetForm();
            setIsOpen(false);
        } catch (err) {
            console.error("Failed to create category", err);
            alert("Failed to create category");
        }
    };

    const handleUpdate = async () => {
        if (!categoryName.trim() || !editingId) return;
        try {
            const res = await api.put(`/categories/${editingId}`, {
                name: categoryName,
                color_code: categoryColor
            });
            setCategories(categories.map(c => c.id === editingId ? res.data : c));
            resetForm();
            // Don't close, user might want to edit more
        } catch (err) {
            console.error("Failed to update category", err);
            alert("Failed to update category");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this category? Logs will be preserved.")) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c.id !== id));
            if (selectedId === id) onSelect(null);
        } catch (err) {
            console.error("Failed to delete category", err);
            alert("Failed to delete category");
        }
    };

    const handleEditStart = (category: Category) => {
        setEditingId(category.id);
        setCategoryName(category.name);
        setCategoryColor(category.color_code);
        setMode("edit");
    };

    const selectedCategory = categories.find((c) => c.id === selectedId);

    return (
        <div className="relative w-64">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white hover:border-neutral-500 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {selectedId === null && showAllOption ? (
                        <span className="text-white">All Categories</span>
                    ) : selectedCategory ? (
                        <>
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: selectedCategory.color_code }}
                            />
                            <span>{selectedCategory.name}</span>
                        </>
                    ) : (
                        <span className="text-neutral-400">{placeholder}</span>
                    )}
                </div>
                <ChevronsUpDown className="w-4 h-4 text-neutral-500" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 p-2">
                    {mode === "list" ? (
                        <>
                            <div className="max-h-48 overflow-y-auto space-y-1 mb-2">
                                {showAllOption && (
                                    <button
                                        onClick={() => {
                                            onSelect(null);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-neutral-800 transition-colors text-white",
                                            selectedId === null && "bg-neutral-800"
                                        )}
                                    >
                                        <span>All Categories</span>
                                        {selectedId === null && (
                                            <Check className="w-4 h-4 ml-auto text-indigo-400" />
                                        )}
                                    </button>
                                )}
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            onSelect(category.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2 rounded text-sm hover:bg-neutral-800 transition-colors text-white group",
                                            selectedId === category.id && "bg-neutral-800"
                                        )}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color_code }}
                                        />
                                        <span className="truncate">{category.name}</span>
                                        {selectedId === category.id && (
                                            <Check className="w-4 h-4 ml-auto text-indigo-400" />
                                        )}
                                        {/* Edit/Delete Actions */}
                                        <div className="ml-auto hidden group-hover:flex items-center gap-2 pl-2 bg-neutral-900/80 backdrop-blur-sm">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditStart(category);
                                                }}
                                                className="text-neutral-500 hover:text-white p-1 cursor-pointer"
                                                title="Edit"
                                            >
                                                <Settings2 className="w-3 h-3" />
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(category.id);
                                                }}
                                                className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {categories.length === 0 && !showAllOption && (
                                    <div className="text-neutral-500 text-xs px-3 py-2">
                                        No categories yet.
                                    </div>
                                )}
                            </div>
                            {!disableCreate && (
                                <div className="pt-2 border-t border-neutral-800">
                                    <button
                                        onClick={() => {
                                            setCategoryName("");
                                            setCategoryColor(COLORS[0]);
                                            setMode("create");
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create New Category</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-3 p-1">
                            <div className="flex items-center justify-between text-white text-sm">
                                <span>{mode === "create" ? "New Category" : "Edit Category"}</span>
                                <button onClick={resetForm} className="text-neutral-500 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Category name..."
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className="w-full bg-neutral-800 border-none rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setCategoryColor(color)}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                            categoryColor === color ? "border-white" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={mode === "create" ? handleCreate : handleUpdate}
                                disabled={!categoryName.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {mode === "create" ? "Create" : "Update"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsOpen(false);
                        resetForm();
                    }}
                />
            )}
        </div>
    );
}
