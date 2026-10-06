import CustomerAuthForm from "../../components/auth/CustomerAuthForm";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return <CustomerAuthForm mode="register" />;
}
