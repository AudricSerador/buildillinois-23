import React, { useState } from "react";
import FileUploader from "../components/file_upload";

const Admin = () => {
  const [message, setMessage] = useState("File status: not uploaded");

  const readFileAsync = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = JSON.parse(event.target?.result as string);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setMessage("File status: uploading");
      const jsonData = await readFileAsync(file);
      console.log("Sending data to server:", jsonData);
      const response = await fetch("/api/import_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });
      if (!response.ok) {
        throw new Error("Error importing data");
      }
      setMessage("File status: uploaded");
    } catch (error) {
      console.error("Error reading the file:", error);
      setMessage("File status: upload failed");
      throw error;
    }
  };

  return (
    <div>
      <h1>Import Food Data</h1>
      <FileUploader onFileUpload={handleFileUpload} />
      {message && <p>{message}</p>}
    </div>
  );
};

export default Admin;
