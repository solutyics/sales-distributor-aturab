import { Toaster } from "react-hot-toast";

const CustomToaster = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className:
          "bg-gray-800 text-white border border-gray-700 rounded-lg shadow-lg px-4 py-3 font-medium text-sm",
        success: {
          iconTheme: { primary: "#10B981", secondary: "white" },
          className: "bg-green-600 text-white",
        },
        error: {
          iconTheme: { primary: "#EF4444", secondary: "white" },
          className: "bg-red-600 text-white",
        },
      }}
    />
  );
};

export default CustomToaster;
