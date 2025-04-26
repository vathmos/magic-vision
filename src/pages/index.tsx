import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex flex-col h-screen w-screen items-center justify-center">
        <Image src="/magic-vision.svg" alt="magic vision icon" width={400} height={0}/>
        <h1 className="text-8xl">COMING SOON!</h1>

      </div>
    </>
  );
}
