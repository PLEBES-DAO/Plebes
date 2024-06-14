import Image from "../../common/Image";

export default function Banner() {
  return (
    <div className="relative">
      <Image
        width={1920}
        height={300}
        src="/img/collections/collection_banner.jpg"
        alt="banner"
        className="h-[18.75rem] object-cover"
      />
    </div>
  );
}
