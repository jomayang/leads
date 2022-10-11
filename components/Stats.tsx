import { Box, Tabs, Tab } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { format, formatDistance } from "date-fns";
import React, { useEffect, useState } from "react";
import { useCoinflip } from "../hooks/useCoinflip";
import { truncate } from "../utils/string";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div className="p-3">{children}</div>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Stats({ connected, publicKey }) {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { winnings } = useCoinflip();

  return (
    <div className="lg:w-96 flex-none">
      {publicKey && (
        <div className="bg-[#1A1022] border-2 border-[#3F2952] p-1 rounded-md border-solid">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab
                sx={{ background: "red" }}
                label="Recent plays"
                {...a11yProps(0)}
              />
              <Tab label="top streaks" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            {winnings.map((win, i) => (
              <div
                key={i}
                className="mt-4 flex items-center space-x-4 text-left"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/1/1e/Default-avatar.jpg"
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className=" font-semibold text-white">
                    Wallet ({truncate(win?.user.toString(), 5)}) flipped{" "}
                    {(win?.amount.toNumber() / 0.7 / 2 / 1000000000).toFixed(2)}{" "}
                    sol and doubled{" "}
                  </div>
                  <div className="mt-0.5 text-xs text-white/60 leading-6">
                    {formatDistance(
                      new Date(win.timestamp.toNumber() * 1000),
                      new Date(),
                      { addSuffix: true }
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
          <TabPanel value={value} index={1}>
            Leaderboard
          </TabPanel>
        </div>
      )}
    </div>
  );
}

export default Stats;
