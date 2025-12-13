"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { InventoryItem } from "@/lib/types";

interface InventoryDialogProps {
  item?: InventoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function InventoryDialog({ item, onClose, onSuccess }: InventoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "", // will be required via custom validation
    quantity: undefined as number | undefined,
    cost_price: undefined as number | undefined,
    selling_price: undefined as number | undefined,
    reorder_level: undefined as number | undefined,
    description: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        cost_price: Number(item.cost_price),
        selling_price: Number(item.selling_price),
        reorder_level: item.reorder_level,
        description: item.description || "",
      });
    }
  }, [item]);

  // simple derived validation that also controls button disabled state
  const isValid = useMemo(() => {
    const hasCategory = showCustomCategory
      ? customCategory.trim().length > 0
      : formData.category.trim().length > 0;

    return (
      formData.name.trim().length > 0 &&
      hasCategory &&
      typeof formData.quantity === "number" &&
      typeof formData.cost_price === "number" &&
      typeof formData.selling_price === "number"
    );
  }, [formData, showCustomCategory, customCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // manual category validation (Select can't use native required)
    const resolvedCategory = showCustomCategory
      ? customCategory.trim().toUpperCase()
      : formData.category.trim().toUpperCase();

    if (!resolvedCategory) {
      setError("Please select or enter a category.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter a name.");
      return;
    }

    if (
      formData.quantity == null ||
      formData.cost_price == null ||
      formData.selling_price == null
    ) {
      setError("Please fill in all required numeric fields.");
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        name: formData.name.trim(),
        category: resolvedCategory,
        quantity: Number(formData.quantity ?? 0),
        cost_price: Number(formData.cost_price ?? 0),
        selling_price: Number(formData.selling_price ?? 0),
        reorder_level: Number(formData.reorder_level ?? 0),
        description: formData.description?.trim() || null,
      };

      const url = item ? `/api/inventory/${item.id}` : "/api/inventory";
      const method = item ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Failed to save item.");
      }
    } catch (err) {
      console.error("[v0] Save error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {item ? "Edit Inventory Item" : "Add New Inventory Item"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {item
              ? "Update the details of the selected product."
              : "Enter the details of the new product to add to your inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Stock
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter stock quantity"
                value={formData.quantity === undefined ? "" : formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: e.target.value !== "" ? Number(e.target.value) : undefined,
                  })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price" className="text-sm font-medium">
                Purchase Price
              </Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                placeholder="Enter purchase price"
                value={formData.cost_price === undefined ? "" : formData.cost_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost_price: e.target.value !== "" ? Number(e.target.value) : undefined,
                  })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price" className="text-sm font-medium">
                Selling Price
              </Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                placeholder="Enter selling price"
                value={formData.selling_price === undefined ? "" : formData.selling_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selling_price: e.target.value !== "" ? Number(e.target.value) : undefined,
                  })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_level" className="text-sm font-medium">
                Low Stock Threshold
              </Label>
              <Input
                id="reorder_level"
                type="number"
                placeholder="Enter threshold value"
                value={formData.reorder_level === undefined ? "" : formData.reorder_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_level: e.target.value !== "" ? Number(e.target.value) : undefined,
                  })
                }
                className="h-11"
              />
            </div>

            {/* Category (custom validation) */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              {showCustomCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="h-11"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCustomCategory(false);
                      setCustomCategory("");
                    }}
                    className="h-11 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOOD">FOOD</SelectItem>
                      <SelectItem value="BEVERAGES">BEVERAGES</SelectItem>
                      <SelectItem value="TOILETRIES">TOILETRIES</SelectItem>
                      <SelectItem value="SNACKS">SNACKS</SelectItem>
                      <SelectItem value="HOUSEHOLD">HOUSEHOLD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setShowCustomCategory(true)}
                    className="h-11 w-11 shrink-0 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {/* helper text to make requirement clear */}
              <p className="text-xs text-muted-foreground">Category is required.</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid}
              className="h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : item ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
