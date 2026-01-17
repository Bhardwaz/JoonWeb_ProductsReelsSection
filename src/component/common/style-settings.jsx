export const renderPaintedText = (text, baseColor = "text-gray-900") => {
  if (!text) return null;
  const words = text.split(" ");

  if (words.length === 1) {
    return (
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 font-extrabold">
        {text}
      </span>
    );
  }

  const lastWord = words.pop();
  const firstPart = words.join(" ");

  return (
    <>
      <span className={`${baseColor} font-bold`}>{firstPart}</span>{" "}
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 font-extrabold">
        {lastWord}
      </span>
    </>
  );
};