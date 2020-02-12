import { getAuthority } from '@/utils/authority';
import * as apiService from '@/services/api';
import * as routerRedux from "react-router-redux";
import { getPageQuery } from '@/utils/utils';

const initState = {
        //loading:true,
        fullName:'',
        teacher:'',
        email:'',
        phonePrefix:'',
        phoneNum:'',
};

export default {
    namespace: 'userInfo',
    state: initState,

    effects: {
        *getUserInfo({ payload }, { call, put }) {
            const onFailed = payload&&payload.onFailed?payload.onFailed:function onFailed(){};

            yield put({
                type: 'updateUserInfo',
                payload: initState,
            });

            const currentUser= getAuthority();
            const userInfoRes = yield call(apiService.getUserInfo,currentUser.username);

            let userInfo = {};
            if(userInfoRes.success)
            {
                userInfo.email = userInfoRes.userInfo.email?userInfoRes.userInfo.email:'';
                userInfo.fullName = userInfoRes.userInfo.fullName?userInfoRes.userInfo.fullName:'';
                userInfo.teacher = userInfoRes.userInfo.teacher?userInfoRes.userInfo.teacher:'';

                let phoneInfoArray = userInfoRes.userInfo.phone?userInfoRes.userInfo.phone.split('-'):[];

                userInfo.phonePrefix = phoneInfoArray[0]?phoneInfoArray[0]:'+86';
                userInfo.phoneNum = phoneInfoArray[1]?phoneInfoArray[1]:'';

                yield put({
                    type: 'updateUserInfo',
                    payload: {
                        ...userInfo,
                    },
                });

                return;
            }


            onFailed && onFailed();
        },
        *saveUserInfo({ payload }, { call, put }){

            const currentUser= getAuthority();
            const onFailed = payload&&payload.onFailed?payload.onFailed:function onFailed(){};
            const onSuccessed = payload&&payload.onSuccessed?payload.onSuccessed:function onSuccessed(){};

            const params = payload&&payload.params?payload.params:{};

            let newUserInfo = {
                email:params.email,
                fullName:params.fullName,
                teacher:params.teacher,
                phone:params.phonePrefix+"-"+params.phoneNum
            };

            //console.log("Update newUserInfo",newUserInfo);

            const updateUserInfoRes = yield call(apiService.updateUserInfo,currentUser.username,newUserInfo);

            if(updateUserInfoRes.success){
                //是否有上一次退出的页面,登录成功重定向
                const urlParams = new URL(window.location.href);
                const params = getPageQuery();
                let { redirect } = params;
                if (redirect) {
                    const redirectUrlParams = new URL(redirect);
                    if (redirectUrlParams.origin === urlParams.origin) {
                        redirect = redirect.substr(urlParams.origin.length);
                        if (redirect.match(/^\/.*#/)) {
                            redirect = redirect.substr(redirect.indexOf('#') + 1);
                        }
                    } else {
                        window.location.href = redirect;
                        return;
                    }


                    yield put(routerRedux.replace(redirect));
                }

                onSuccessed && onSuccessed();
            }else{
                onFailed && onFailed();
            }
        },
    },
    reducers:{
        updateUserInfo(state,{payload}){
            //console.log("updateJob",payload);
            return {
                ...state,
                ...payload
            }
        }
    },
}
