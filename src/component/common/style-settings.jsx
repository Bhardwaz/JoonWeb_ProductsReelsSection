export const renderPaintedText = (text, baseColor, highlightColor) => {
  if (!text) return null;
  const words = text.split(" ");

  const getGradientStyle = () => {
    if (!highlightColor) return {};
    return {
      backgroundImage: `linear-gradient(to right, ${highlightColor}, ${highlightColor}aa)`, // Fades to 66% opacity
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    };
  };

  const gradientClasses = highlightColor 
    ? "bg-clip-text text-transparent font-extrabold" 
    : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 font-extrabold";

  if (words.length === 1) {
    return (
      <span 
        className={gradientClasses}
        style={getGradientStyle()}
      >
        {text}
      </span>
    );
  }

  const lastWord = words.pop();
  const firstPart = words.join(" ");

  return (
    <>
      <span className={`${baseColor || 'text-black'} font-bold`}>{firstPart}</span>{" "}
      <span 
        className={gradientClasses}
        style={getGradientStyle()}
      >
        {lastWord}
      </span>
    </>
  );
};