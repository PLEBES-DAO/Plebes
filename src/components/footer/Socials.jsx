import { socials } from "../../data/socials";

export default function Socials() {
  return (
    <>
      {socials.map((elm, i) => (
        <a
          key={i}
          href={elm.href}
          className="group rtl:ml-4 rtl:mr-0"
          target="_blank"
          rel="noopener noreferrer" // Security measure for opening links in a new tab
        >
          <img src={elm.src} alt={`Social icon ${i}`} />
        </a>
      ))}
    </>
  );
}
