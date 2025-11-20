import { useState } from "react";
import axios from "axios";

function App() {
  const [files, setFiles] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(new Set());
  const [view, setView] = useState("upload"); // New state to toggle views
  const MAX_FILES = 5;

  // Fetch uploaded images from server
  const loadGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3000/images");
      setGallery(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  // File selection for upload
  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > MAX_FILES) {
      alert(`You can only upload up to ${MAX_FILES} images at a time.`);
      return;
    }
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Remove selected file before upload
  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) return alert("Select files to upload");

    const formData = new FormData();
    files.forEach(f => formData.append("images", f.file));

    try {
      await axios.post("http://localhost:3000/images/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Images uploaded successfully");
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      loadGallery(); // Refresh gallery after upload
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // Delete single image
  const handleDeleteSingle = async (filename) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await axios.delete(`http://localhost:3000/images/${filename}`);
      setGallery(prev => prev.filter(img => img.filename !== filename));
      setSelectedForDelete(prev => {
        const newSet = new Set(prev);
        newSet.delete(filename);
        return newSet;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };

  // Toggle selection for batch delete
  const toggleSelectForDelete = (filename) => {
    setSelectedForDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) newSet.delete(filename);
      else newSet.add(filename);
      return newSet;
    });
  };

  // Delete selected images
  const handleDeleteSelected = async () => {
    if (selectedForDelete.size === 0) return;
    if (!window.confirm("Delete selected images?")) return;

    try {
      for (const filename of selectedForDelete) {
        await axios.delete(`http://localhost:3000/images/${filename}`);
      }
      setGallery(prev => prev.filter(img => !selectedForDelete.has(img.filename)));
      setSelectedForDelete(new Set());
      alert("Selected images deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected images");
    }
  };

  // Toggle between views (upload and gallery)
  const toggleView = () => {
    if (view === "upload") {
      loadGallery(); // Load gallery when switching to it
      setView("gallery");
    } else {
      setView("upload");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "Arial" }}>
 <h1
  style={{
    position: "sticky",
    top: 0,
    backgroundImage: "url('https://academy.ikusasasolutions.co.za/pluginfile.php/1/theme_academi/logo/1757054904/logo%20%283%29.png')", // Corrected image URL
    backgroundSize: "cover", // Ensure the image covers the full container
    backgroundPosition: "center", // Center the background image
    backgroundRepeat: "no-repeat", // Prevent the image from repeating
    color: "#fff", // Text color for visibility
    padding: "20px", // Add padding to give space around text
    zIndex: 10,
    borderRadius: "10px", // Optional: Smooth corners
    backdropFilter: "blur(8px)", // Apply blur effect behind the element
    WebkitBackdropFilter: "blur(8px)", // For Safari compatibility
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background for contrast
    textShadow: "0 0 5px rgba(0, 0, 0, 0.8)", // Optional: subtle shadow for text to make it stand out more
  }}
>
  ITS Gallery Portal - Upload & Manage Images
</h1>



      {/* View Toggle Container */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "1rem",
        borderRadius: "30px",
        backgroundColor: "#f0f4f8",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}>
        <button
          onClick={toggleView}
          style={{
            flex: 1,
            padding: "1rem 0",
            backgroundColor: view === "upload" ? "#4f46e5" : "#d1d5db",
            color: view === "upload" ? "white" : "black",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s ease-in-out",
            borderRight: "1px solid #ddd",
          }}
        >
          Upload Images
        </button>
        <button
          onClick={toggleView}
          style={{
            flex: 1,
            padding: "1rem 0",
            backgroundColor: view === "gallery" ? "#4f46e5" : "#d1d5db",
            color: view === "gallery" ? "white" : "black",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s ease-in-out",
          }}
        >
          View Gallery
        </button>
      </div>

      {/* Panel Containers with fixed height */}
      <div style={{
        display: view === "upload" ? "block" : "none",
        height: "400px",
        overflowY: "auto",
        transition: "height 0.3s ease-in-out",
        marginBottom: "2rem",
      }}>
        {/* Upload Panel */}
        <input type="file" multiple onChange={handleFilesChange} style={{ marginBottom: "1rem" }} />
        <p>Max {MAX_FILES} images at a time</p>

        {files.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            {files.map((f, index) => (
              <div key={index} style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.5rem",
                textAlign: "center",
                width: 150,
                position: "relative",
              }}>
                <img src={f.preview} alt={f.file.name} style={{ width: "100%", borderRadius: "6px" }} />
                <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{f.file.name}</p>
                <button
                  onClick={() => handleRemoveFile(index)}
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    lineHeight: "16px",
                    padding: 0,
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleUpload} style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#4f46e5",
          color: "white",
          fontSize: "1rem",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}>
          Upload
        </button>
      </div>

      <div style={{
        display: view === "gallery" ? "block" : "none",
        height: "400px",
        overflowY: "auto",
        transition: "height 0.3s ease-in-out",
      }}>
        {/* Gallery Panel */}
        {loading && <p style={{ color: "#555" }}>Loading gallery…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && gallery.length === 0 && <p style={{ color: "#555" }}>No images found in the gallery.</p>}

        {gallery.length > 0 && (
          <>
            {selectedForDelete.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontSize: "1rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginBottom: "1rem",
                  marginLeft: "1rem",
                }}
              >
                Delete Selected
              </button>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              {gallery.map(img => (
                <div
                  key={img.filename}
                  style={{
                    border: selectedForDelete.has(img.filename) ? "2px solid #ef4444" : "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: 150,
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleSelectForDelete(img.filename)}
                >
                  <img src={`http://localhost:3000${img.url}`} alt={img.filename} style={{ width: "100%", borderRadius: "6px" }} />
                  <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{img.filename}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSingle(img.filename); }}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      lineHeight: "16px",
                      padding: 0,
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
