import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { db } from "../firebase-config";
import {
  getDocs,
  collection,
  query,
  orderBy,
  limit,
} from "@firebase/firestore";
import dateFormat from "dateformat";
import { useEffect, useState } from "react";
import { CSVLink, CSVDownload } from "react-csv";
const Home: NextPage = () => {
  const [leads, setLeads] = useState<any>([]);
  const [leadsCsv, setLeadsCsv] = useState<any>([]);
  useEffect(() => {
    const getLeads = async () => {
      try {
        const leadsRef = collection(db, "leads");
        const leadsQuery = query(leadsRef, orderBy("timestamp", "desc"));
        const leadsSnap = await getDocs(leadsQuery);
        const leadsData = leadsSnap.docs.map((doc) => ({
          ...doc.data(),
          // id: doc.id,
        }));
        setLeads(leadsData);
        let csv: any = [];
        leadsData.map((lead: any) => {
          csv = [
            ...csv,
            [
              lead.fullName,
              lead.number,
              lead.province,
              lead.address,
              dateFormat(
                lead.timestamp.toDate(),
                "dddd, mmmm dS, yyyy, h:MM:ss TT"
              ),
            ],
          ];
        });
        const csvData = [
          ["firstname", "lastname", "email"],
          ["Ahmed", "Tomi", "ah@smthing.co.com"],
          ["Raed", "Labes", "rl@smthing.co.com"],
          ["Yezzi", "Min l3b", "ymin@cocococo.com"],
        ];
        console.log(csvData);
        setLeadsCsv(csvData);
        console.log("the csv: ", csv);
        console.log(leadsData);
      } catch (error) {
        console.log(error);
      }
    };
    getLeads();
  }, []);
  return (
    <div>
      <h1 className="text-5xl font-bold mx-10 capitalize">leads</h1>
      <div className="mx-10">
        <CSVLink className="btn my-10" data={leads}>
          Export Leads
        </CSVLink>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th></th>
                <th>Full Name</th>
                <th>Number</th>
                <th>Wilaya</th>
                <th>Address</th>
                <th>Date and Time</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any, i: number) => (
                <tr key={i}>
                  <th>{i}</th>
                  <td>{lead.fullName}</td>
                  <td>{lead.number}</td>
                  <td>{lead.province}</td>
                  <td>{lead.address}</td>
                  <td>
                    {dateFormat(
                      lead.timestamp.toDate(),
                      "dddd, mmmm dS, yyyy, h:MM:ss TT"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
