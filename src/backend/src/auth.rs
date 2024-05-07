use ntex::service::{Middleware, Service, ServiceCtx};
use ntex::web;

pub struct Login;

impl<S> Middleware<S> for Login {
    type Service = LoginMiddleware<S>;

    fn create (&self, service: S) -> Self::Service {
        LoginMiddleware { service }
    }
}

pub struct LoginMiddleware <S> {
    service: S,
}

impl<S, Err> Service<web::WebRequest<Err>> for LoginMiddleware<S>
where
    S: Service<web::WebRequest<Err>, Response = web::WebResponse, Error = web::Error>,
    Err: web::ErrorRenderer,
{
    type Response = web::WebResponse;
    type Error = web::Error;


    ntex::forward_poll_ready!(service);

    async fn call(&self, req: web::WebRequest<Err>, ctx: ServiceCtx<'_, Self>) -> Result<Self::Response, Self::Error> {
        
        println!("Request: {:?}", req);

        let user_authenticated = match req.headers().get("Authorization") {
            Some(auth) => {

                // Need to implement authentication here
                // To see if the token is valid

                let auth = auth.to_str().unwrap();
                true
            },
            None => false,
        };
        if user_authenticated {
            let res = ctx.call(&self.service, req).await?;
            Ok(res)
        } else {

            // Need to change to error after

            let res = ctx.call(&self.service, req).await?;
            Ok(res)
        }

    }
}
