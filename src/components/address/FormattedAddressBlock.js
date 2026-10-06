import { countryName, displayPhone, normalizedStateLabel } from "../../lib/addressContact";

const UserIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-5 0-9 2.5-9 5.5V21h18v-1.5C21 16.5 17 14 12 14Z" /></svg>;
const PhoneIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M6.6 10.8a15.3 15.3 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.4.6 3.7.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.7 22 2 13.3 2 2.8c0-.6.4-1 1-1h4.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.7.1.4 0 .8-.3 1.1l-2.2 2.2Z" /></svg>;
const PinIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" /></svg>;

export default function FormattedAddressBlock({ address, className = "", showPhone = true, showName = true }) {
  if (!address) return null;
  const lines = [address.addressLine1, address.addressLine2, address.landmark].filter(Boolean);
  const locality = [address.city, normalizedStateLabel(address.state), address.pincode].filter(Boolean).join(", ");
  const country = countryName(address.country);
  return <address className={`not-italic text-sm leading-6 text-stone-300 ${className}`}>
    {showName && address.fullName ? <p className="flex items-center gap-2 font-medium text-white"><span className="text-[#d4af37]"><UserIcon /></span>{address.fullName}</p> : null}
    {showPhone && address.phone ? <p className="mt-1 flex items-center gap-2"><span className="text-[#d4af37]"><PhoneIcon /></span>{displayPhone(address.phone, address.country)}</p> : null}
    {lines.length || locality || country ? <p className="mt-2 flex items-start gap-2"><span className="mt-1 text-[#d4af37]"><PinIcon /></span><span>{lines.map((line) => <span key={line} className="block">{line}</span>)}{locality ? <span className="block">{locality}</span> : null}{country ? <span className="block">{country}</span> : null}</span></p> : null}
  </address>;
}
