import { useState, useCallback } from "react";
import { api } from "../../lib/api"; // adjust path

export function useEnquiry() {
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [fieldErrors, setFieldErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    const submit = useCallback(async (payload) => {
        if (status === "loading") return;

        setStatus("loading");
        setFieldErrors({});
        setErrorMessage("");

        try {
            const response = await api.post("/products/enquiry", payload);
            console.log("USE ENQUIRY RESPONSE", response);
            if (response.statusCode !== 201) {
                throw new Error(response.message);
            }

            setStatus("success");

            return {
                success: true,
                data: response,
            };
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;

                if (status === 422) {
                    const errors = {};

                    if (Array.isArray(data.errors)) {
                        data.errors.forEach((item) => {
                            errors[item.field] = item.message;
                        });
                    }

                    setFieldErrors(errors);
                    setStatus("idle");

                    return {
                        success: false,
                    };
                }

                setErrorMessage(data.message || "Submission failed");
            } else {
                setErrorMessage(err.message || "Something went wrong");
            }

            setStatus("error");

            return {
                success: false,
            };
        }
    }, [status]);

    const reset = useCallback(() => {
        setStatus("idle");
        setFieldErrors({});
        setErrorMessage("");
    }, []);

    return {
        status,
        fieldErrors,
        errorMessage,
        submit,
        reset,
    };
}