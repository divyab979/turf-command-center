import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  venueId?: string;
  onSuccess?: () => void;
}

const AVAILABLE_AMENITIES = [
  "parking",
  "washroom",
  "floodlights",
  "seating",
  "drinking water",
  "café",
  "changing room",
];

export const CreateVenueForm = ({ venueId, onSuccess }: Props) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!venueId;

  // Load existing data from backend if in edit mode
  useEffect(() => {
    if (isEditMode && venueId) {
      api.get(`/venues/${venueId}`)
        .then((res) => {
          const venue = res.data;
          if (venue) {
            setName(venue.name || "");
            setLocation(venue.location || "");
            setAddress(venue.address || `${venue.name} Street, ${venue.location}`);
            setPhotos(venue.photos || ["https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800"]);
            setAmenities(venue.amenities || ["parking", "washroom", "floodlights"]);
          }
        })
        .catch((err) => {
          console.error("Failed to load venue details", err);
          toast.error("Failed to fetch venue details from backend");
        });
    }
  }, [venueId, isEditMode]);

  const handleToggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim() && !photos.includes(newPhotoUrl.trim())) {
      setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
    }
  };

  const handleRemovePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, url]);
      toast.success("Photo selected");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      toast.error("Please fill in name and location");
      return;
    }

    try {
      setSaving(true);
      if (isEditMode) {
        // Edit Mode: PATCH /venues/:id
        await api.patch(`/venues/${venueId}`, {
          name,
          location,
        });
        toast.success("Venue successfully updated");
      } else {
        // Create Mode: POST /venues
        await api.post("/venues", {
          name,
          location,
        });
        toast.success("New Venue successfully registered");
      }

      await queryClient.invalidateQueries({
        queryKey: ["venues"],
      });
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to save venue details";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-medium text-slate-700 text-xs">
      <div>
        <Label className="text-slate-500 font-bold">Venue Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="GameUp Arena"
          className="mt-2 rounded-xl"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-500 font-bold">Short Location / City</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Mumbai"
            className="mt-2 rounded-xl"
            required
          />
        </div>

        <div>
          <Label className="text-slate-500 font-bold">Upload Local Photo</Label>
          <div className="relative mt-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="venue-photo-file"
            />
            <label
              htmlFor="venue-photo-file"
              className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-xl p-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 font-bold text-xs"
            >
              <Plus size={16} />
              <span>Select File</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-slate-500 font-bold">Full Venue Address</Label>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Sector 5, Hiranandani Gardens, Powai, Mumbai - 400076"
          className="mt-2 rounded-xl"
        />
      </div>

      <div>
        <Label className="text-slate-500 font-bold">Venue Amenities</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {AVAILABLE_AMENITIES.map((amenity) => {
            const isSelected = amenities.includes(amenity);
            return (
              <button
                type="button"
                key={amenity}
                onClick={() => handleToggleAmenity(amenity)}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-emerald-800 text-white border-emerald-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-slate-500 font-bold">Venue Photos (URLs)</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="Paste Photo URL (e.g. https://images.unsplash.com/...)"
            className="rounded-xl flex-1"
          />
          <Button
            type="button"
            onClick={handleAddPhoto}
            className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold shrink-0"
          >
            Add URL
          </Button>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
            {photos.map((p, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-white">
                <img src={p} alt="Venue preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(p)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11"
        disabled={saving}
      >
        {isEditMode ? (saving ? "Saving..." : "Save Changes") : (saving ? "Creating..." : "Create Venue")}
      </Button>
    </form>
  );
};