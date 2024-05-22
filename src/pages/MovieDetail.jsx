/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMonth } from "../utils/getDate";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import { SlLocationPin } from "react-icons/sl";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DropdownMobile from "../components/DropdownMobile";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setOrder } from "../redux/reducer/order";

function MovieDetail() {
  const [guide, setGuide] = useState("");
  const [isDropdownShown, setIsDropdownShow] = useState(false);
  const { id: movieId } = useParams();
  const [movies, setMovies] = useState([{}]);

  const getMovie = useCallback(async () => {
    const res1 = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/movies/${movieId}`,
      {
        params: {
          status: "now airing",
        },
      }
    );

    setMovies(res1.data.results);
  },[movieId]);

  const [cinema, setCinema] = useState([]);

  const getCinema = useCallback(async () => {
    try {
      const {data} = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/movie-cinema/${movieId}`
      );
      data.results.cinema = data.results.cinema.map((value) => JSON.parse(value))
      setCinema(data.results.cinema);
    } catch (error) {
      console.log(error)
    }
  },[movieId]);

  let releaseDate = "";
  if (movies && movies.releaseDate) {
    const str = movies?.releaseDate;
    const x =
      getMonth(str) + " " + Number(str.slice(5, 7)) + ", " + str.slice(0, 4);
    releaseDate = x;
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    getMovie();
    getCinema()
  }, [getCinema, getMovie]);

  const [cinemaIndicator, setCinemaIndicator] = useState();
  const [cinemaLocation, setCineamaLocation] = useState();
  const [movieTime, setMovieTime] = useState();
  const [choosedLocation, setChoosedLocation] = useState();
  const [choosedDate, setChoosedDate] = useState();
  const [choosedTime, setChoosedTime] = useState();
  const [chooseDateList, setChooseDateLIst] = useState([]);

  const [movieCinemaData, setMovieCinemaData] = useState();
  const getCinemaId = async (cinemaId, data) => {
    setMovieCinemaData(data);
    if (cinemaIndicator) {
      document.getElementById(cinemaIndicator).className =
        "flex items-center justify-center h-32 border-2 rounded-md md:w-1/4";
    }
    document.getElementById(cinemaId).className =
      "flex items-center justify-center h-32 border-2 rounded-md border-primary md:w-1/4";
    setCinemaIndicator(cinemaId);
    const res = await axios.get(
      // note!
      `${import.meta.env.VITE_BACKEND_URL}/cinema-location/${cinemaId}`
    );
    setCineamaLocation(res.data.results);
    const res1 = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/movie-time?movieCinemaId=${
        data.movieCinemaId
      }`
    );
    res1.data.results = res1.data.results.map((value) => JSON.parse(value.airingTimeDate))
    setMovieTime(res1.data.results);
  };

  const [listLocation, setListLocation] = useState(false);
  const [cinemaLocationId, setCinemaLocationId] = useState();
  const [locationId, setLocationId] = useState();
  const showLocation = (x, id, locId) => {
    if (!listLocation) {
      setListLocation(true);
    } else {
      setListLocation(false);
    }
    if (x) {
      setChoosedLocation(x);
      setCinemaLocationId(id);
      setLocationId(locId);
    }
    setChooseDateLIst(movieTime.filter((item,index) => movieTime.findIndex(obj => obj.date === item.date) === index))
  };

  const [dateId, setDateId] = useState();
  const [listDate, setListDate] = useState(false);
  const [time, setTime] = useState();

  const showDate = async (x, id) => {
    if (!listDate) {
      setListDate(true);
    } else {
      setListDate(false);
    }
    if (x) {
      setChoosedDate(x);
      setDateId(id);
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/airing-time-date?dateId=${id}`
      );
      setTime(res.data.results);
    }
  };

  const [timeId, setTimeId] = useState();
  const [listTime, setListTime] = useState(false);
  const showTime = (x, id) => {
    if (!listTime) {
      setListTime(true);
    } else {
      setListTime(false);
    }
    if (x) {
      setChoosedTime(x);
      setTimeId(id);
    }
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getDataOrder = async () => {
    const res = await axios.get(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/airing-time-date-id?airingTimeId=${timeId}&dateId=${dateId}`
    );
    const res1 = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/movie-time-id?airingTimeDateId=${
        res.data.results.id
      }&movieCinemaId=${movieCinemaData.movieCinemaId}`
    );

    const data = {
      title: movies?.title,
      genre: movies?.genre,
      time: choosedTime,
      cinemaName: movieCinemaData.cinemaName,
      cinemaImage: movieCinemaData.cinemaImage,
      date: choosedDate,
      movieTimeId: res1.data.results.id,
      cinemaLocationId,
      movieImage: movies?.image,
      movieId: movies?.id,
      cinemaId: movieCinemaData.cinemaId,
      locationId: locationId,
      airingTimeId: timeId,
      dateId: dateId,
      price: movieCinemaData.price,
    };
    dispatch(setOrder(data));

    if (data.movieTimeId) {
      navigate("/order");
    }
  };

  return (
    <>
      {guide && (
        <div className="fixed left-[50%] -translate-x-[50%] bg-red-100 text-red-500 rounded-3xl px-5 h-10 top-[7%] z-50 items-center justify-center flex text-lg b">
          {guide}
        </div>
      )}
      <Navbar isClick={() => setIsDropdownShow(true)} />
      <header className="hidden lg:block w-full h-[415px] font-mulish text-light relative bg-cover bg-center" style={{ backgroundImage: `url(${movies?.image})` }}>
        <div className="w-full h-full  px-11 xl:px-[130px] absolute bg-black bg-opacity-40"></div>
      </header>
      <section className="px-5 md:px-11 xl:px-[130px] font-mulish lg:-top-36 lg:relative flex flex-col gap-y-7 mt-10">
        <div className="flex flex-col gap-y-4 md:flex-row md:gap-x-5 ">
          <img className=" w-full h-full md:w-[20rem] md:h-[25rem] object-contain" src={movies?.image} alt="movie"/>
          <div className="flex flex-col justify-center gap-y-4 lg:justify-between">
            <p className="text-[2rem] text-dark font-bold lg:mt-28">
              {movies?.title}
            </p>
            <div className="flex flex-row gap-x-2">
              {movies.genre && movies.genre.map((value, i) => {
                return (
                  <p key={i} className="text-[#A0A3BD] px-5 py-2 bg-[#A0A3BD1A] rounded-[20px]">
                      {value}
                  </p>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-y-2">
                <p className="text-sm text-[#8692A6]">Release Date</p>
                <p className="text-[#121212]">{releaseDate}</p>
              </div>
              <div className="flex flex-col col-span-2 gap-y-2">
                <p className="text-sm text-[#8692A6]">Directed By</p>
                <p className="text-[#121212]">{movies?.director}</p>
              </div>
              <div className="flex flex-col gap-y-2">
                <p className="text-sm text-[#8692A6]">Duration</p>
                <p className="text-[#121212]">{movies?.duration}</p>
              </div>
              <div className="flex flex-col col-span-2 gap-y-2">
                <p className="text-sm text-[#8692A6]">Casts</p>
                <p className="text-[#121212]">{movies?.casts}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-[20px] font-semibold text-[#000]">Synopsis</p>
          <p className="text-[#A0A3BD] leading-6 lg:w-5/6">
            {movies?.synopsis}
          </p>
        </div>

        {movies.status === "now airing" ? (
          <div className="flex flex-col gap-7">
            <div>
              <p className="text-xl md:text-[2rem] text-[#121212] mb-5">Book Tickets</p>
              <div className="flex flex-col gap-y-4 md:flex-row md:items-end md:gap-x-4 lg:gap-x-[30px]">
                <div className="flex flex-col gap-y-4 md:w-1/4">
                  <p className="relative md:text-[20px] font-semibold text-black w-fit">
                    Chose Date
                    {choosedLocation && !choosedDate ? (
                      <div className="absolute top-0 -right-2">
                        <span className="relative flex w-3 h-3">
                          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-500"></span>
                          <span className="relative inline-flex w-3 h-3 rounded-full bg-sky-600"></span>
                        </span>
                      </div>
                    ) : choosedLocation && choosedDate ? (
                      <div className="absolute -right-2.5 -top-1.5">
                        <span className="relative flex w-4 h-4">
                          <span className="relative inline-flex items-center justify-center w-full h-full text-xs font-bold text-white rounded-full bg-sky-600">
                            <FiCheck />
                          </span>
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                  </p>
                  <div className="relative flex flex-col justify-center items-center py-4 bg-[#EFF0F6] rounded-md cursor-pointer w-full">
                    <button disabled={!choosedLocation} onClick={() => {showDate()}} type="button" className="flex items-center justify-center w-full gap-4 px-4">
                      <FiCalendar />
                      <p className="text-xs font-semibold lg:text-base text-[#4E4B66]">
                        {choosedDate ? choosedDate : "---------"}
                      </p>
                      <div className="flex items-end justify-end flex-1">
                        {listDate ? (<MdKeyboardArrowUp />) : (<MdKeyboardArrowDown />)}
                      </div>
                    </button>
                    <div className={`${listDate ? "" : "hidden"} bg-[#EFF0F6] flex flex-col gap-2 absolute top-10 rounded-md px-4 w-full py-4 z-10`}>
                      {movieTime &&
                        chooseDateList.map((item, index) => {
                          return (<button className="flex justify-start w-full" key={index} onClick={() => showDate(item.date, item.dateId)}>{item.date}</button>)
                        })
                        // movieTime.map((x, i) => {
                        //   return (
                        //     <div className="w-full border-b text-[#4E4B66] hover:border-b hover:border-slate-800" key={i}>
                        //       <button className="flex justify-start w-full" type="button" onClick={() => {showDate(x[i].date, x[i].id)}}>
                        //         {console.log(movieTime)}
                        //         {x[i].date}
                        //       </button>
                        //     </div>
                        //   );
                        // })
                      }
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-4 md:w-1/4">
                  <p className="relative md:text-[20px] font-semibold text-black w-fit">
                    Chose Time
                    {choosedDate && !choosedTime ? (
                      <div className="absolute top-0 -right-2">
                        <span className="relative flex w-3 h-3">
                          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-500"></span>
                          <span className="relative inline-flex w-3 h-3 rounded-full bg-sky-600"></span>
                        </span>
                      </div>
                      ) : choosedDate && choosedTime ? (
                      <div className="absolute -right-2.5 -top-1.5">
                        <span className="relative flex w-4 h-4">
                          <span className="relative inline-flex items-center justify-center w-full h-full text-xs font-bold text-white rounded-full bg-sky-600">
                            <FiCheck />
                          </span>
                        </span>
                      </div>
                      ) : ("")
                    }
                  </p>
                  <div className="relative flex flex-col justify-center items-center py-4 bg-[#EFF0F6] rounded-md cursor-pointer w-full">
                    <button disabled={!choosedDate} onClick={() => {showTime()}} type="button" className="flex items-center justify-center w-full gap-4 px-4">
                      <FiClock />
                      <p className="text-xs font-semibold lg:text-base text-[#4E4B66]">
                        {choosedTime ? choosedTime : "---------"}
                      </p>
                      <div className="flex items-end justify-end flex-1">
                        {listTime ? (<MdKeyboardArrowUp />) : (<MdKeyboardArrowDown />)}
                      </div>
                    </button>
                    <div className={`${listTime ? "" : "hidden"} bg-[#EFF0F6] flex flex-col gap-2 absolute top-10 rounded-md px-4 w-full py-4`}>
                      {time &&
                        time.map((x, i) => {
                          let time;
                          let id;
                          if (x.airingTimeId) {
                            time = x.airingTime;
                            time = time.slice(11, 16);
                            id = x.airingTimeId;
                          }
                          return (
                            <div className="w-full border-b text-secondary hover:border-b hover:border-slate-800" key={i}>
                              <button className="flex justify-start w-full" type="button" onClick={() => {showTime(time, id)}}>
                                {time}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-4 md:w-1/4">
                  <p className="relative md:text-[20px] font-semibold text-black w-fit">
                    Chose Location
                    {movieCinemaData && !choosedLocation ? (
                      <div className="absolute top-0 -right-2">
                        <span className="relative flex w-3 h-3">
                          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-500"></span>
                          <span className="relative inline-flex w-3 h-3 rounded-full bg-sky-600"></span>
                        </span>
                      </div>
                    ) : movieCinemaData && choosedLocation ? (
                      <div className="absolute -right-2.5 -top-1.5">
                        <span className="relative flex w-4 h-4">
                          <span className="relative inline-flex items-center justify-center w-full h-full text-xs font-bold text-white rounded-full bg-sky-600">
                            <FiCheck />
                          </span>
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                  </p>
                  <div
                    className={`relative flex flex-col justify-center items-center py-4 bg-[#EFF0F6] rounded-md cursor-pointer w-full`}
                  >
                    <button
                      disabled={!movieCinemaData}
                      type="button"
                      onClick={() => {
                        showLocation();
                      }}
                      className="flex items-center justify-center w-full gap-4 px-4"
                    >
                      <SlLocationPin />
                      <p className="text-xs font-semibold lg:text-base text-[#4E4B66]">
                        {choosedLocation ? choosedLocation : "---------"}
                      </p>
                      <div className="flex items-end justify-end flex-1">
                        {listLocation ? (
                          <MdKeyboardArrowUp />
                        ) : (
                          <MdKeyboardArrowDown />
                        )}
                      </div>
                    </button>
                    <div
                      className={`${
                        listLocation ? "" : "hidden"
                      } bg-[#EFF0F6] flex flex-col gap-2 absolute top-10 rounded-md px-4 w-full py-4`}
                    >
                      {cinemaLocation &&
                        cinemaLocation.location &&
                        cinemaLocation.location.map((x, i) => {
                          const id = cinemaLocation.cinemaLocationId[i];
                          const locId = cinemaLocation.LocationId[i];
                          return (
                            <div
                              className="w-full border-b text-secondary hover:border-b hover:border-slate-800"
                              key={i}
                            >
                              <button
                                className="flex justify-start w-full"
                                type="button"
                                onClick={() => {
                                  showLocation(x, id, locId);
                                }}
                              >
                                {x}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-y-4">
              <div className="flex items-center self-start gap-x-7">
                <p
                  className={`relative md:text-[20px] text-[#121212] font-semibold`}
                >
                  Choose Cinema
                  {!movieCinemaData ? (
                    <div className="absolute top-0 -right-2">
                      <span className="relative flex w-3 h-3">
                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-500"></span>
                        <span className="relative inline-flex w-3 h-3 rounded-full bg-sky-600"></span>
                      </span>
                    </div>
                  ) : (
                    <div className="absolute -right-2.5 -top-1.5">
                      <span className="relative flex w-4 h-4">
                        <span className="relative inline-flex items-center justify-center w-full h-full text-xs font-bold text-white rounded-full bg-sky-600">
                          <FiCheck />
                        </span>
                      </span>
                    </div>
                  )}
                </p>
                <p className="text-[18px] text-[#8692A6] font-bold">
                  {cinema?.length} Result
                </p>
              </div>
              <div className="flex flex-col w-full overflow-hidden gap-y-4 md:flex-row md:gap-x-4">
                {cinema &&
                  cinema.map((value, index) => {
                    const data = {
                      movieCinemaId: value.movieCinemaId,
                      cinemaName: value.cinemaName,
                      cinemaImage: value.cinemaImage,
                      cinemaId: value.cinemaId,
                      price: value.cinemaPrice,
                    };
                    return (
                      <div
                        key={index}
                        id={value.cinemaId}
                        className={`flex items-center justify-center h-32 border-2 rounded-md md:w-1/4 overflow-hidden`}
                      >
                        <button
                          name="cinemaButton"
                          onClick={() => {
                            getCinemaId(value.cinemaId, data);
                          }}
                          type="button"
                          className="w-full h-full"
                        >
                          <div className="flex items-center justify-center w-full h-full p-7">
                            <img
                              src={value.cinemaImage}
                              alt={value.cinemaName}
                            />
                          </div>
                        </button>
                      </div>
                    );
                  })}
              </div>

              <div>
                <button
                  disabled={
                    !movieCinemaData ||
                    !choosedLocation ||
                    !choosedDate ||
                    !choosedTime
                  }
                  onClick={getDataOrder}
                  className="px-16 py-5 text-sm rounded-md text-light disabled:text-dark bg-primary disabled:bg-[#EFF0F6] justify-self: center active:scale-95 transition-all"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div>
              <p className="text-xl md:text-[2rem] text-[#121212] mb-5">
                Movie Is In Coming on {releaseDate}
              </p>
            </div>
            <Link to="/">
              <button className="px-4 py-2 font-bold text-white rounded bg-primary hover:bg-secondary">
                Go Back to Homepage
              </button>
            </Link>
          </div>
        )}
      </section>
      <Footer />
      {isDropdownShown && (
        <DropdownMobile isClick={() => setIsDropdownShow(false)} />
      )}
    </>
  );
}

export default MovieDetail;
