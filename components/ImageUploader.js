"use client";

import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";

export default function ImageUploader({ onImageSelect }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFile = useCallback((file) => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                onImageSelect(file, reader.result);
            };
            reader.readAsDataURL(file);
        } else if (file.type === "application/pdf") {
            setPreview("PDF");
            onImageSelect(file, null);
        } else {
            alert("Please upload an image or PDF file.");
        }
    }, [onImageSelect]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        },
        [handleFile]
    );

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearImage = () => {
        setPreview(null);
        onImageSelect(null, null);
    };

    return (
        <div className="uploader-wrapper">
            {preview ? (
                <div className="uploader-box glass-panel active">
                    <div className="preview-container">
                        {preview === "PDF" ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--accent)' }}>
                                <Upload size={48} />
                                <span style={{ marginTop: '1rem', fontWeight: 600 }}>PDF Selected</span>
                            </div>
                        ) : (
                            <img src={preview} alt="Preview" className="preview-image" />
                        )}
                        <button onClick={clearImage} className="clear-btn">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <label
                    className={`uploader-box ${dragActive ? "active" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="uploader-content">
                        <Upload className="upload-icon" />
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Click to upload</span> or drag and drop
                        </p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>SVG, PNG, JPG, GIF or PDF</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        style={{ display: 'none' }}
                        accept="image/*,application/pdf"
                        onChange={handleChange}
                    />
                </label>
            )}
        </div>
    );
}
