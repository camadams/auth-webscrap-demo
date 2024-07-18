"use client";
import { useFormState, useFormStatus } from "react-dom";
import Arrow from "../arrow";
import Spinner from "../spinner";
import { scrap } from "./action";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../navbar";
import { validateRequest } from "@/lib/validate-request";
import { User } from "lucia";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const [state, action] = useFormState(scrap, null);
  const [url, setUrl] = useState<AirbnbSearchParams>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await validateRequest();
        setUser(user);
      } catch (error) {
        console.error("Failed to validate request:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return "loading";
  }
  if (!user) {
    return redirect("/login");
  }
  return (
    <>
      <Navbar user={user} />
      <div className="flex mt-16 justify-center m-8">
        <div className="rounded-lg bg-slate-200 shadow-orange-100 shadow-2xl p-16 space-y-4">
          <h1>
            Enter the URL from Airbnbs website after you have searched for
            listings
          </h1>
          <button
            className="underline text-blue-600"
            onClick={async () =>
              await navigator.clipboard.writeText(
                "https://www.airbnb.co.za/s/Cape-Town--Western-Cape--South-Africa/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&monthly_start_date=2024-06-01&monthly_length=3&monthly_end_date=2024-09-01&price_filter_input_type=1&channel=EXPLORE&query=Cape%20Town%2C%20Western%20Cape&place_id=ChIJ1-4miA9QzB0Rh6ooKPzhf2g&date_picker_type=flexible_dates&flexible_trip_dates%5B%5D=october&flexible_trip_dates%5B%5D=september&adults=1&source=structured_search_input_header&search_type=user_map_move&search_mode=regular_search&price_filter_num_nights=28&ne_lat=-34.1022032339858&ne_lng=18.47622637502542&sw_lat=-34.10891042062033&sw_lng=18.46928919979797&zoom=16.51538932078821&zoom_level=16.51538932078821&search_by_map=true&price_max=8082&amenities%5B%5D=4&flexible_trip_lengths%5B%5D=one_month"
              )
            }
          >
            Or click here to copy an example
          </button>
          <form action={action} className="space-y-6">
            <label htmlFor="username">URL</label>
            <input
              onChange={(e) => setUrl(parseAirbnbSearchParams(e.target.value))}
              className="ml-2 rounded-lg"
              type="url"
              name="airbnbUrl"
              id="username"
            />
            <SubmitButton />
          </form>
          {/* <p className="bg-slate-200 w-32">{state?.res}</p> */}
          {url && (
            <div className="p-4 bg-slate-100 rounded-2xl mt-4">
              <div className="flex gap-2">
                <div>Start:</div>
                <div>{url.monthly_start_date}</div>
              </div>
              <div className="flex gap-2">
                <div>End:</div>
                <div>{url.monthly_end_date}</div>
              </div>
              <div className="flex gap-2">
                <div>Months:</div>
                <div>{url.monthly_length}</div>
              </div>
              <div className="flex gap-2">
                <div>Max Price:</div>
                <div>{url.price_max}</div>
              </div>
            </div>
          )}
          {state?.res && (
            <div className="p-4 bg-slate-100 rounded-2xl mt-4 space-x-4">
              {state?.res?.map((href, i) => (
                <Link
                  target="_"
                  className="text-blue-600 underline"
                  key={i}
                  href={href}
                >
                  view listing{" "}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button className="ml-2  bg-red-400 p-4 text-white rounded-full">
      {status.pending ? <Spinner /> : <Arrow />}
    </button>
  );
}

type AirbnbSearchParams = {
  monthly_start_date?: string;
  monthly_length?: number;
  monthly_end_date?: string;
  price_max?: number;
};

function parseAirbnbSearchParams(queryString: string): AirbnbSearchParams {
  const urlParams = new URLSearchParams(queryString);
  return {
    monthly_start_date: urlParams.get("monthly_start_date") as string,
    monthly_length: parseInt(urlParams.get("monthly_length") as string, 10),
    monthly_end_date: urlParams.get("monthly_end_date") as string,
    price_max: parseInt(urlParams.get("price_max") as string, 10),
  };
}
