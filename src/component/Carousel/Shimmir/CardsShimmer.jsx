import React from "react";
import { useResize } from "../../../hooks/useResize";

const CardsShimmer = () => {
  const isMobile = useResize()
  let size;
  isMobile ? size = 5 : size = 7

  const items = Array.from({ length: size })
  return (
    items?.map((item, index) => {
      return (
          <div key={index} className="w-[200px] flex flex-col rounded-xl overflow-hidden bg-white relative">

            <div className="w-full h-[355px] bg-gray-200 animate-pulse relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
              </div>
            </div>

            <div className="w-full h-[65px] bg-white p-2 flex flex-col justify-center gap-2 border-t border-gray-100">

              <div className="h-3.5 bg-gray-200 rounded w-[85%] animate-pulse" />

              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-300 rounded w-[30%] animate-pulse" />

                <div className="h-3 bg-gray-100 rounded w-[20%] animate-pulse" />

                <div className="h-4 bg-gray-200 rounded w-[25%] animate-pulse ml-auto" />
              </div>

            </div>
          </div>
      )
    })
  );
};

export default CardsShimmer;