use tide::utils::async_trait;

use crate::User;

pub struct AuthMiddleware {}

#[async_trait]
impl<State> tide::Middleware<State> for AuthMiddleware
where
  State: Clone + Send + Sync + 'static,
{
  async fn handle(&self, req: tide::Request<State>, next: tide::Next<'_, State>) -> tide::Result {
    if req.ext::<User>().is_none() {
      let mut res: tide::Response = tide::Response::new(401);
      res.insert_header("WWW-Authenticate", "Basic");

      return Ok(res);
    }

    Ok(next.run(req).await)
  }
}
