import React, { useEffect, useRef } from "react";

interface ProjectBlockProps {
  name: string;
  registerPosition: (id: string, rect: DOMRect) => void;
}

export const ProjectBlock: React.FC<ProjectBlockProps> = ({
  name,
  registerPosition,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      registerPosition("project", ref.current.getBoundingClientRect());
    }
  }, [registerPosition]);

  return (
    <div ref={ref} className="inline-block">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg text-center text-lg">
        {name}
      </div>
    </div>
  );
};
