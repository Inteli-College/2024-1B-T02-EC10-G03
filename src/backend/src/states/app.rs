use crate::{db, repositories};
use db::*;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct AppState {
	pub db: Arc<PrismaClient>,
	pub redis: redis::aio::MultiplexedConnection,
	pub repositories: repositories::Repositories,
}

impl AppState {
	pub fn new(
		db: Arc<PrismaClient>,
		redis: redis::aio::MultiplexedConnection,
		repositories: repositories::Repositories,
	) -> Self {
		Self { db, redis, repositories }
	}
}

pub type AppStateType = Arc<RwLock<AppState>>;
