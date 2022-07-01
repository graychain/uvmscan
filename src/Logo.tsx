import React from "react";
import Otter from "./uvm_logo.png";

const Logo: React.FC = () => (
  <div className="mx-auto text-4xl text-link-gray font-title font-bold cursor-default flex items-center space-x-4">
    <img
      className="rounded-full"
      src={Otter}
      width={96}
      height={96}
      alt="An otter scanning"
      title="An otter scanning"
    />
    <span>Urbit Virtual Machine</span>
  </div>
);

export default React.memo(Logo);
