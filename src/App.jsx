import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { useEffect } from "react";
import {
    getRomeList,
    getRomeInfo,
    getUserCsgoInfo,
    getUserCs2Info,
    getProfile,
    getSeason,
} from "./api";
import { Table, Select, Tabs, Button } from "antd";
import { merge, keys } from "lodash";
function App() {
    let [dataSource, setDataSource] = useState([]);
    let [season, setSeason] = useState(10);
    let [userInfo, setUserInfo] = useState({ csgo: {}, cs2: {} });
    let [roomListOp, setRoomList] = useState([]);
    let [roomId, setRoomId] = useState();
    let [ranking, setRanking] = useState();
    let [activeKey, setActiveKey] = useState("CSGO");

    let columns = [
        {
            title: "名字",
            dataIndex: "name",
            width: "20%",
            render: (text, row) => {
                let { name, avatar } = row;
                return (
                    <div
                        className="flex-r-c"
                        onClick={() => {
                            window.open(`https://csgod.top/profile/${row.steam}`);
                        }}
                    >
                        <img
                            src={`https://csgod.top/api/image?url=${avatar}&w=32&h=32`}
                            alt=""
                            style={{ width: "32px", borderRadius: "32px" }}
                        />{" "}
                        &nbsp; &nbsp;
                        <span>{name}</span>
                    </div>
                );
            },
        },
        {
            title: "Rating",
            dataIndex: "rating",
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: "分数",
            dataIndex: "ranking",
            sorter: (a, b) => a.ranking - b.ranking,
        },
        {
            title: "场均Rating",
            dataIndex: "avg_rating",
            sorter: (a, b) => a.avg_rating - b.avg_rating,
            render: (text, row) => {
                let { avg_rating } = row;
                return (
                    <span style={{ color: "#e95454", fontWeight: "600" }}>
                        {avg_rating}
                    </span>
                );
            },
        },
        {
            title: "场均数据（击杀/死亡）",
            dataIndex: "avg_kills",
            render: (text, row) => {
                let { avg_kills, avg_deaths } = row;
                return `${avg_kills}/${avg_deaths}`;
            },
        },
        {
            title: "胜率",
            dataIndex: "win_rate",
            sorter: (a, b) => a.win_rate - b.win_rate,
            render: (text, row) => {
                let { win_rate, changci = 0 } = row;
                return `${win_rate}% （最近${changci}场）`;
            },
        },
        {
            title: "完美段位",
            dataIndex: "pwa",
            render: (text, row) => {
                let { pwa } = row;
                return (
                    <div className="flex-r-c">
                        {pwa ? (
                            <img
                                src={`https://cdn.max-c.com/game/csgo/wm/rank/${pwa
                                    .substring(0, 1)
                                    .toLowerCase()}_plus.png`}
                                alt=""
                                style={{ width: "32px", borderRadius: "32px", height: "32px" }}
                            />
                        ) : (
                            "暂无"
                        )}
                    </div>
                );
            },
        },
    ];
    let getUserCsgoInfoData = (profile_id, season) => {
        return getUserCsgoInfo(profile_id, season).then((res) => {
            return {
                [profile_id]: res.data.map((ite) => {
                    let { kills, deaths, rating, result } = ite;
                    return {
                        kills,
                        deaths,
                        rating,
                        result,
                    };
                }),
            };
        });
    };
    let getUserCs2InfoData = (profile_id, season) => {
        return getUserCs2Info(profile_id, season).then((res) => {
            return {
                [profile_id]: res.data.map((ite) => {
                    let { kills, deaths, rating, result } = ite;
                    return {
                        kills,
                        deaths,
                        rating,
                        result,
                    };
                }),
            };
        });
    };

    let getRomeListData = () => {
        getRomeList().then((res) => {
            let items = res
                .map((item) => {
                    return {
                        label: `房间号：${item.sid} 阶段：${item.state} 模式：${item.mode} 地点：${item.location}`,
                        value: item.sid,
                        disabled: item.offline,
                        flag: item.offline ? 0 : 1,
                    };
                })
                .sort((a, b) => {
                    return b.flag - a.flag;
                });
            setRoomList(items);
        });
    };
    useEffect(() => {
        getRomeListData();
        getSeasonData();
    }, []);
    let getProfileData = useCallback((profile_id) => {
        return getProfile(profile_id).then((res) => {
            let ranking = res.nodes[2].data[5];
            let rating = res.nodes[2].data[6];
            return {
                [profile_id]: {
                    ranking,
                    rating,
                },
            };
        });
    }, []);
    let getRomeData = useCallback(() => {
        roomId &&
            getRomeInfo(roomId).then((res) => {
                let { players } = res;
                setDataSource(players);
                Promise.all(players.map((item) => getProfileData(item.steam))).then(
                    (res) => {
                        let result = res.reduce((pre, cur) => {
                            return merge(pre, cur);
                        }, {});
                        keys(result).forEach((item) => {
                            result[item] = {
                                ranking:
                                    typeof result[item].ranking == "number"
                                        ? result[item].ranking
                                        : 9999,
                                rating:
                                    typeof result[item].rating == "number"
                                        ? result[item].rating
                                        : 0,
                            };
                        });
                        setRanking(result);
                    }
                );
                if (activeKey === "CSGO") {
                    Promise.all(
                        players.map((item) => getUserCsgoInfoData(item.steam, season))
                    ).then((res) => {
                        setUserInfo((pre) => {
                            return merge({}, pre, {
                                csgo: res.reduce((pre, cur) => {
                                    return merge(pre, cur);
                                }, {}),
                            });
                        });
                    });
                } else {
                    Promise.all(
                        players.map((item) => getUserCs2InfoData(item.steam, season))
                    ).then((res) => {
                        setUserInfo((pre) => {
                            return merge({}, pre, {
                                cs2: res.reduce((pre, cur) => {
                                    return merge(pre, cur);
                                }, {}),
                            });
                        });
                    });
                }
            });
    }, [roomId, activeKey, season]);
    useEffect(() => {
        getRomeData();
    }, [getRomeData]);
    let getSeasonData = useCallback(() => {
        getSeason().then((res) => {
            setSeason(res.data.data.season)
        });
    }, []);
    let newDataSource = useMemo(() => {
        return dataSource
            .map((item) => {
                let changci = userInfo.csgo[item.steam]?.length;
                let result = userInfo.csgo[item.steam]?.reduce(
                    (pre, item) => {
                        pre["avg_kills"] = pre.avg_kills + item.kills;
                        pre["avg_deaths"] = pre.avg_deaths + item.deaths;
                        pre["avg_rating"] = pre.avg_rating + item.rating;
                        pre["win_rate"] =
                            item.result == 1 ? pre.win_rate + 1 : pre.win_rate;
                        return pre;
                    },
                    { avg_kills: 0, avg_deaths: 0, avg_rating: 0, win_rate: 0 }
                );
                let { avg_kills, avg_deaths, avg_rating, win_rate } = result || {
                    avg_kills: 0,
                    avg_deaths: 0,
                    avg_rating: 0,
                    win_rate: 0,
                };
                return {
                    ...item,
                    ...ranking?.[item.steam],
                    avg_kills: changci ? Math.ceil(avg_kills / changci) : 0,
                    avg_deaths: changci ? Math.ceil(avg_deaths / changci) : 0,
                    avg_rating: changci ? (avg_rating / changci).toFixed(2) : 0,
                    win_rate: changci ? ((win_rate / changci) * 100).toFixed(0) : 0,
                    changci,
                };
            })
            .sort((a, b) => {
                return b.rating - a.rating;
            });
    }, [dataSource, ranking, userInfo.csgo]);

    let newCS2DataSource = useMemo(() => {
        let res = dataSource
            .map((item) => {
                let changci = userInfo.cs2[item.steam]?.length;
                let result = userInfo.cs2[item.steam]?.reduce(
                    (pre, item) => {
                        pre["avg_kills"] = pre.avg_kills + item.kills;
                        pre["avg_deaths"] = pre.avg_deaths + item.deaths;
                        pre["avg_rating"] = pre.avg_rating + item.rating;
                        pre["win_rate"] =
                            item.result == 1 ? pre.win_rate + 1 : pre.win_rate;
                        return pre;
                    },
                    { avg_kills: 0, avg_deaths: 0, avg_rating: 0, win_rate: 0 }
                );
                let { avg_kills, avg_deaths, avg_rating, win_rate } = result || {
                    avg_kills: 0,
                    avg_deaths: 0,
                    avg_rating: 0,
                    win_rate: 0,
                };

                return {
                    ...item,
                    avg_kills: changci ? Math.ceil(avg_kills / changci) : 0,
                    avg_deaths: changci ? Math.ceil(avg_deaths / changci) : 0,
                    avg_rating: changci ? (avg_rating / changci).toFixed(2) : 0,
                    win_rate: changci ? ((win_rate / changci) * 100).toFixed(0) : 0,
                    changci,
                };
            })
            .sort((a, b) => {
                return b.avg_rating - a.avg_rating;
            });
        return res;
    }, [dataSource, userInfo.cs2]);
    let items = useMemo(() => {
        return [
            {
                key: "CSGO",
                label: "CSGO",
                children: (
                    <Table
                        columns={columns}
                        dataSource={newDataSource}
                        rowKey={"steam"}
                    />
                ),
            },
            {
                key: "cs2",
                label: "CS2",
                children: (
                    <Table
                        columns={[columns[0], ...columns.slice(3)]}
                        dataSource={newCS2DataSource}
                        rowKey={"steam"}
                    />
                ),
            },
        ];
    }, [newCS2DataSource, columns, newDataSource]);
    return (
        <div style={{ padding: "10px 20px" }}>
            房间号：
            <Select
                showSearch
                style={{ width: "40%" }}
                placeholder="输入房间号"
                optionFilterProp="label"
                onChange={setRoomId}
                options={roomListOp}
            />
            <Button
                style={{ marginLeft: "10px" }}
                type={"primary"}
                onClick={getRomeData}
            >
                刷新
            </Button>
            <Tabs
                defaultActiveKey="CSGO"
                onChange={(at) => {
                    setActiveKey(at);
                }}
                items={items}
                destroyInactiveTabPane={true}
            />
            <p style={{
                position: 'fixed',
                bottom: 0,
                fontSize: '14px'
            }}>design by 鸭川太太</p>
        </div>
    );
}

export default App;
