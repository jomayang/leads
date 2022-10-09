import React from "react";

function Sidebar() {
  return (
    <div className="lg:w-48 flex-none">
      <div className="w-full border-2 border-solid border-[#3F2952] rounded-md">
        <div className="py-2 px-3 bg-[#3F2952] outline-none">Stats</div>
        <div className="py-2 px-3 border-b border-[#3F2952]">
          <a href="" className=" hover:text-[#E93A88]">
            Todays&apos;s Stats Leaderboard
          </a>
        </div>
        <div className="flex flex-col py-3">
          <a href="" className="py-2 px-3 hover:text-[#E93A88]">
            Live
          </a>
          <a href="" className="py-2 px-3 hover:text-[#E93A88]">
            About
          </a>
          <a href="" className="py-2 px-3 hover:text-[#E93A88]">
            How To Play
          </a>
          <a href="" className="py-2 px-3 hover:text-[#E93A88]">
            Flip Resposively
          </a>
          <a href="" className="py-2 px-3 hover:text-[#E93A88]">
            Big Bounty
          </a>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
