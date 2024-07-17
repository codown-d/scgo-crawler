import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { useEffect } from "react";
import {
    getRomeList,
    getRomeInfo,
    getUserCsgoInfo,
    getUserCs2Info,
    getProfile,
} from "./api";
import { Table, Select } from "antd";
import { merge ,keys} from "lodash";
const getSearchParams = (url) => {
    // 获取查询参数前的 ? 对应的索引位置
    const searchIndex = url.indexOf("?");
    // 截取出查询参数字符串，并根据 & 将其分割成一个个 name=bruce 形式字符串组成的数组
    const searchParamsArray = url.slice(searchIndex + 1).split("&");
    // 遍历数组，组成查询参数对象
    return searchParamsArray.reduce((pre, cur) => {
        const [key, value] = cur.split("=");
        return {
            ...pre,
            // 需要使用 decodeURIComponent 对参数进行解码
            [key]: decodeURIComponent(value),
        };
    }, {});
};
function App() {
    let params = getSearchParams(window.location.href);
    let { season = 10 } = params;
    let [dataSource, setDataSource] = useState([]);
    let [userInfo, setUserInfo] = useState({ csgo: {}, cs2: {} });
    let [roomListOp, setRoomList] = useState([]);
    let [roomId, setRoomId] = useState();
    let [ranking, setRanking] = useState();
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
                            window.open(`https://csgod.top/profile/${row.steam}?season=10`);
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
            title: "排名",
            dataIndex: "ranking",
            sorter: (a, b) => a.ranking - b.ranking,
        },
        {
            title: "场均Rating",
            dataIndex: "avg_rating",
            sorter: (a, b) => a.avg_rating - b.avg_rating,
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
                let { win_rate, changci } = row;
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
    let getUserCsgoInfoData = (profile_id) => {
        return getUserCsgoInfo(profile_id).then((res) => {
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
    let getUserCs2InfoData = (profile_id) => {
        return getUserCs2Info(profile_id).then((res) => {
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
                        }, {})
                        keys(result).forEach(item => {
                            result[item]={
                                ranking: typeof result[item].ranking == 'number' ? result[item].ranking : 9999,
                                rating: typeof result[item].rating == 'number' ? result[item].rating : 0,
                            }
                        })
                        setRanking(result);
                    }
                );

                Promise.all(
                    players.map((item) => getUserCsgoInfoData(item.steam))
                ).then((res) => {
                    setUserInfo((pre) => {
                        return merge({}, pre, {
                            csgo: res.reduce((pre, cur) => {
                                return merge(pre, cur);
                            }, {}),
                        });
                    });
                });
                Promise.all(players.map((item) => getUserCs2InfoData(item.steam))).then(
                    (res) => {
                        console.log(res)
                        setUserInfo((pre) => {
                            return merge({},pre, {
                                cs2: res.reduce((pre, cur) => {
                                    return merge(pre, cur);
                                }, {}),
                            });
                        });
                    }
                );
            });
    }, [roomId]);
    useEffect(() => {
        getRomeData();
    }, [getRomeData]);
    let newDataSource = useMemo(() => {
        return dataSource
            .map((item) => {
                let changci = userInfo.csgo[item.steam]?.length;
                let result = userInfo.csgo[item.steam]?.reduce((pre, item) => {
                    pre['avg_kills'] = pre.avg_kills + item.kills;
                    pre['avg_deaths'] = pre.avg_deaths + item.deaths;
                    pre['avg_rating'] = pre.avg_rating + item.rating;
                    pre['win_rate'] = item.result == 1 ? pre.win_rate + 1 : pre.win_rate
                    return pre
                }, { avg_kills: 0, avg_deaths: 0, avg_rating: 0, win_rate: 0 });
                let { avg_kills, avg_deaths, avg_rating, win_rate } = result || { avg_kills: 0, avg_deaths: 0, avg_rating: 0, win_rate: 0 }
                return {
                    ...item,
                    ...ranking?.[item.steam],
                    avg_kills: Math.ceil(avg_kills / changci),
                    avg_deaths: Math.ceil(avg_deaths / changci),
                    avg_rating: (avg_rating / changci).toFixed(2),
                    win_rate: ((win_rate / changci) * 100).toFixed(0),
                    changci,
                };
            })
            .sort((a, b) => {
                return b.rating - a.rating;
            });
    }, [dataSource, ranking, userInfo.csgo]);

    let newCS2DataSource = useMemo(() => {
        console.log(dataSource,userInfo.cs2)
        let res =  dataSource
            .map((item) => {
                let changci = userInfo.cs2[item.steam]?.length;
                let result = userInfo.cs2[item.steam]?.reduce((pre, item) => {
                    pre['avg_kills'] = pre.avg_kills + item.kills;
                    pre['avg_deaths'] = pre.avg_deaths + item.deaths;
                    pre['avg_rating'] = pre.avg_rating + item.rating;
                    pre['win_rate'] = item.result == 1 ? pre.win_rate + 1 : pre.win_rate
                    return pre
                }, { avg_kills: 0, avg_deaths: 0, avg_rating: 0, win_rate: 0 });
                let { avg_kills, avg_deaths, avg_rating, win_rate } = result || { avg_kills: 0, avg_deaths: 0, avg_rating: 0, win_rate: 0 }
                console.log(avg_kills,avg_deaths,avg_rating,win_rate,changci)
                
                return {
                    ...item,
                    avg_kills:changci? Math.ceil(avg_kills / changci):0,
                    avg_deaths: changci?Math.ceil(avg_deaths / changci):0,
                    avg_rating: changci?(avg_rating / changci).toFixed(2):0,
                    win_rate: changci?((win_rate / changci) * 100).toFixed(0):0,
                    changci,
                };
            })
            .sort((a, b) => {
                return b.avg_rating - a.avg_rating;
            });
            console.log(res)
            return res
    }, [dataSource, userInfo.cs2]);

    return (
        <div style={{ padding: "10px 20px" }}>
            房间号：{" "}
            <Select
                showSearch
                style={{ width: "40%" }}
                placeholder="输入房间号"
                optionFilterProp="label"
                onChange={setRoomId}
                options={roomListOp}
            />
            <h2>CSGO</h2>
            <Table
                columns={columns}
                dataSource={newDataSource}
                rowKey={"steam"}
                style={{ marginTop: "20px" }}
            />
            <h2>CS2</h2>
            <Table
                columns={[columns[0],...columns.slice(3)]}
                dataSource={newCS2DataSource}
                rowKey={"steam"}
                style={{ marginTop: "20px" }}
            />
        </div>
    );
}

export default App;
