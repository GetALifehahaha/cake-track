import React, { useState } from "react";
import { Button, Label } from "../atoms";
import { ModalBody } from "../molecules";
import useIngredient from "@/hooks/useIngredient";
import { Title } from "../atoms";
import { X, Upload } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { useToast } from "@/context/ToastContext";
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
} from "@/api/constants";

const AddRecipeModal = ({ onClose, onCreated }) => {
    const { addToast } = useToast();
    const { ingredientData, ingredientLoading, ingredientError } =
        useIngredient(true);

    const [recipeName, setRecipeName] = useState("");
    const [recipePrice, setRecipePrice] = useState("");
    const [ingredientItems, setIngredientItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [search, setSearch] = useState("");

    if (ingredientLoading) return <h5>Loading ingredients...</h5>;
    if (ingredientError) return <h5>Error loading ingredients</h5>;

    const addIngredientItem = (id, name) => {
        if (ingredientItems.some((i) => i.ingredient_id === id)) return;

        setIngredientItems((prev) => [
            ...prev,
            { ingredient_id: id, name, amount_needed: 0 },
        ]);
    };

    const removeIngredientItem = (index) => {
        setIngredientItems(ingredientItems.filter((_, i) => i !== index));
    };

    const updateIngredientItem = (index, value) => {
        const updated = ingredientItems.map((item, i) =>
            i === index ? { ...item, amount_needed: Number(value) } : item
        );
        setIngredientItems(updated);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setErrorMessages((prev) => [
                    ...prev,
                    "Please upload a valid image file",
                ]);
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessages((prev) => [
                    ...prev,
                    "Image size should be less than 5MB",
                ]);
                return;
            }

            setImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const uploadToCloudinary = async (imageFile) => {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to upload image");
            }

            const data = await response.json();
            return data.secure_url; // Returns the Cloudinary URL
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw error;
        }
    };

    const handleSetShowConfirm = () => setShowConfirm(true);
    const handleSetCloseConfirm = () => setShowConfirm(false);

    const createRecipe = async () => {
        if (!recipeName || !recipePrice) {
            addToast("Recipe name and price are required", "error");
            return;
        }
        if (ingredientItems.length === 0) {
            addToast("Add at least one ingredient", "error");
            return;
        }

        const payload = {
            name: recipeName,
            price: parseFloat(recipePrice),
            ingredients: ingredientItems.map((i) => ({
                ingredient: i.ingredient_id,
                amount_needed: i.amount_needed,
            })),
            image: image ? await uploadToCloudinary(image) : null,
        };

        console.log("Payload for creating recipe:", payload);

        // try {
        //     await api.post('/recipes/', payload); // adjust endpoint as needed
        //     addToast("Recipe created successfully");
        //     handleSetCloseConfirm();
        //     onClose();
        //     if (onCreated) onCreated();
        // } catch (err) {
        //     console.error(err);
        //     addToast("Failed to create recipe");
        // }
    };

    const filteredIngredients = ingredientData.filter(ing => 
        ing.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ModalBody>
            {/* Header */}
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-border w-[80vw]">
                    <Title text="Add Recipe" variant="modal" />
                    <X
                        size={20}
                        className="text-text cursor-pointer hover:text-accent"
                        onClick={onClose}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden p-6">
                    {/* Recipe Info Section */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <Label text="Recipe Name" variant="modal" />
                            <input
                                type="text"
                                placeholder="What would you like to call this recipe?"
                                className="w-full p-2.5 bg-main-dark/50 rounded-md focus:outline-none"
                                value={recipeName}
                                onChange={(e) => setRecipeName(e.target.value)}
                            />
                        </div>
                        <div className="w-40">
                            <Label text="Price" variant="modal" />
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full p-2.5 bg-main-dark/50 rounded-md focus:outline-none"
                                value={recipePrice}
                                onChange={(e) => setRecipePrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label text="Image" variant="modal" />
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-32 h-20 object-cover rounded-md border border-border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-error text-main-white rounded-full p-1 hover:bg-opacity-80"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center justify-center gap-2 px-4 h-20 bg-main border border-border rounded-md cursor-pointer hover:bg-main-dark transition-colors">
                                    <Upload size={16} className="text-text-light" />
                                    <span className="text-sm text-text-light">Upload</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="flex gap-4 h-[calc(100%-120px)]">
                        {/* Available Ingredients Panel */}
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <div className="px-4 py-3 bg-main-white border-b border-border">
                                <Label text="Available Ingredients" variant="modal" />

                                <input
                                    type="text"
                                    placeholder="Search ingredients..."
                                    className="w-full p-2.5 bg-main-dark/50 rounded-md focus:outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto p-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredIngredients.map((ingredient) => (
                                        <button
                                            key={ingredient.id}
                                            className="px-3 py-2 rounded-md bg-accent text-main-white hover:bg-accent-dark transition-colors text-left text-sm font-medium cursor-pointer"
                                            onClick={() =>
                                                addIngredientItem(ingredient.id, ingredient.name)
                                            }
                                        >
                                            {ingredient.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Selected Ingredients Panel */}
                        <div className="w-96 flex flex-col bg-main border border-border rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-main-white border-b border-border">
                                <Label text="Selected Ingredients" variant="modal" />
                            </div>
                            <div className="flex-1  p-3">
                                {ingredientItems.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray text-center">
                                        <p className="text-sm">
                                            Click ingredients to add them to your recipe
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 overflow-y-auto h-48">
                                        {ingredientItems.map((ingredient, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 bg-main-white border border-border p-3 rounded-md"
                                            >
                                                <span className="flex-1 text-sm font-medium text-text">
                                                    {ingredient.name}
                                                </span>
                                                <input
                                                    type="number"
                                                    className="w-20 px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                                    value={ingredient.amount_needed}
                                                    onChange={(e) =>
                                                        updateIngredientItem(index, e.target.value)
                                                    }
                                                    placeholder="Qty"
                                                />
                                                <button
                                                    onClick={() => removeIngredientItem(index)}
                                                    className="text-text-light hover:text-error transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                    <Button variant="modalOutline" text="Cancel" onClick={onClose} />
                    <Button
                        variant="modalBlock"
                        text="Create Recipe"
                        onClick={handleSetShowConfirm}
                    />
                </div>

                {showConfirm && (
                    <ConfirmationModal
                        title="Create Recipe?"
                        content="Are you sure you want to create this recipe?"
                        onConfirm={createRecipe}
                        onReject={handleSetCloseConfirm}
                    />
                )}
        </ModalBody>
    );
};

export default AddRecipeModal;
