"""
Generate the models in the databse. Then create a company "sonans" and user 
associated with this company. 

Usage:

    python setup_database.py [company_slug] [email] [password]

"""

import sys
import os
from app.models import Company, User
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from datetime import datetime
import dotenv
import bcrypt


def main(args):
    if len(args) != 4:
        raise SystemExit(__doc__)

    dotenv.load_dotenv()
    engine = create_engine(os.getenv("DATABASE_URI"))

    slug = args[1]
    email = args[2]
    password = bcrypt.hashpw(args[3].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    with Session(engine) as session:
        company = Company(slug=slug, created_at=datetime.now())
        session.add(company)
        session.flush()
        user = User(
            password=password,
            email=email,
            company_id=company.id,
            created_at=datetime.now(),
        )
        session.add(user)
        session.commit()


if __name__ == "__main__":
    main(sys.argv)
