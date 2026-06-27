"""
Demo seed script — creates one clean agency with login credentials,
properties, clients across all pipeline stages, interactions, and slots.

Login after seeding:
  Email:    demo@propflow.com
  Password: Demo@1234
"""
import asyncio
import bcrypt
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

import backend.models.agency
import backend.models.team_member
import backend.models.property
import backend.models.client
import backend.models.interaction_log
import backend.models.site_visit_slot
import backend.models.call_log

from backend.core.database import engine
from backend.models.agency import Agency
from backend.models.team_member import TeamMember
from backend.models.property import Property, PropertyType, PropertyStatus
from backend.models.client import Client, ClientStage
from backend.models.interaction_log import InteractionLog, InteractionType
from backend.models.site_visit_slot import SiteVisitSlot

AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

DEMO_EMAIL = "demo@propflow.com"
DEMO_PASSWORD = "Demo@1234"


def now_offset(days=0, hours=0):
    return datetime.utcnow() - timedelta(days=days, hours=hours)


async def seed():
    async with AsyncSessionLocal() as session:
        # ── Agency ───────────────────────────────────────────────────────────
        tenant_id = uuid4()
        agency = Agency(
            id=tenant_id,
            name="PropFlow Demo Agency",
            slug="propflow-demo",
            created_at=now_offset(30),
        )
        session.add(agency)
        await session.commit()
        print(f"✓ Agency: {agency.name}  (id={tenant_id})")

        # ── Owner (team member) ───────────────────────────────────────────────
        hashed = bcrypt.hashpw(DEMO_PASSWORD.encode(), bcrypt.gensalt()).decode()
        owner_id = uuid4()
        owner = TeamMember(
            id=owner_id,
            tenant_id=tenant_id,
            email=DEMO_EMAIL,
            hashed_password=hashed,
            full_name="Ahmad Raza",
            role="owner",
            created_at=now_offset(30),
        )
        session.add(owner)

        agent_id = uuid4()
        agent = TeamMember(
            id=agent_id,
            tenant_id=tenant_id,
            email="agent@propflow.com",
            hashed_password=hashed,
            full_name="Sara Khan",
            role="agent",
            created_at=now_offset(25),
        )
        session.add(agent)
        await session.commit()
        print(f"✓ Owner:  {owner.full_name}  ({DEMO_EMAIL})")
        print(f"✓ Agent:  {agent.full_name}  (agent@propflow.com)")

        # ── Properties ───────────────────────────────────────────────────────
        properties = [
            Property(id=uuid4(), tenant_id=tenant_id,
                title="3-Bed House DHA Phase 6 Lahore",
                description="Brand new house in prime location, near commercial market. Well-ventilated, gated community.",
                property_type="house", status="available",
                price=28500000, area_sqft=2400, bedrooms=3, bathrooms=3,
                city="Lahore", area="DHA Phase 6",
                address="Street 12, Block D, DHA Phase 6, Lahore",
                photos=["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"],
                created_at=now_offset(20)),

            Property(id=uuid4(), tenant_id=tenant_id,
                title="5-Bed Corner House Bahria Town Lahore",
                description="Stunning 5-bedroom corner house with spacious lawn and servant quarters.",
                property_type="house", status="available",
                price=65000000, area_sqft=4500, bedrooms=5, bathrooms=5,
                city="Lahore", area="Bahria Town",
                address="Sector F, Bahria Town, Lahore",
                photos=["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"],
                created_at=now_offset(18)),

            Property(id=uuid4(), tenant_id=tenant_id,
                title="2-Bed Luxury Apartment Gulberg III",
                description="Modern apartment on 8th floor with city view, 24/7 security and generator backup.",
                property_type="apartment", status="available",
                price=15500000, area_sqft=1100, bedrooms=2, bathrooms=2,
                city="Lahore", area="Gulberg III",
                address="Eden Tower, Main Boulevard Gulberg III, Lahore",
                photos=["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
                created_at=now_offset(15)),

            Property(id=uuid4(), tenant_id=tenant_id,
                title="10 Marla Plot DHA Phase 8 Lahore",
                description="Possession paid plot on 30-ft road. Ideal for construction.",
                property_type="plot", status="available",
                price=22000000, area_sqft=2250, bedrooms=None, bathrooms=None,
                city="Lahore", area="DHA Phase 8",
                address="Block T, DHA Phase 8, Lahore",
                photos=[],
                created_at=now_offset(12)),

            Property(id=uuid4(), tenant_id=tenant_id,
                title="3-Bed Apartment F-10 Islamabad",
                description="Semi-furnished apartment in one of Islamabad's most sought-after sectors.",
                property_type="apartment", status="available",
                price=19800000, area_sqft=1350, bedrooms=3, bathrooms=2,
                city="Islamabad", area="F-10",
                address="Block 3, F-10 Markaz, Islamabad",
                photos=["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
                created_at=now_offset(10)),

            Property(id=uuid4(), tenant_id=tenant_id,
                title="Commercial Office Space Blue Area",
                description="1st floor commercial unit in Blue Area, ideal for corporate office.",
                property_type="commercial", status="available",
                price=35000000, area_sqft=2000, bedrooms=None, bathrooms=2,
                city="Islamabad", area="Blue Area",
                address="Jinnah Avenue, Blue Area, Islamabad",
                photos=[],
                created_at=now_offset(8)),

            Property(id=uuid4(), tenant_id=tenant_id,
                title="4-Bed House Askari 11 Lahore",
                description="Well-maintained house in Askari 11 with basement and solar system installed.",
                property_type="house", status="sold",
                price=45000000, area_sqft=3200, bedrooms=4, bathrooms=4,
                city="Lahore", area="Askari 11",
                address="Sector B, Askari 11, Lahore",
                photos=["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
                created_at=now_offset(45)),
        ]
        for p in properties:
            session.add(p)
        await session.commit()
        print(f"✓ Properties: {len(properties)} added")

        # ── Clients ───────────────────────────────────────────────────────────
        c1_id = uuid4()
        c2_id = uuid4()
        c3_id = uuid4()
        c4_id = uuid4()
        c5_id = uuid4()

        clients = [
            Client(id=c1_id, tenant_id=tenant_id,
                full_name="Bilal Ahmed", phone="+923001234567",
                email="bilal.ahmed@gmail.com",
                budget_min=25000000, budget_max=35000000,
                preferred_city="Lahore", preferred_area="DHA",
                bedrooms_needed=3, property_type_needed="house",
                notes="Looking for a house in DHA Phase 5 or 6. Ready to buy within a month.",
                stage="new_lead", created_at=now_offset(7)),

            Client(id=c2_id, tenant_id=tenant_id,
                full_name="Ayesha Malik", phone="+923331234567",
                email="ayesha.malik@hotmail.com",
                budget_min=14000000, budget_max=18000000,
                preferred_city="Lahore", preferred_area="Gulberg",
                bedrooms_needed=2, property_type_needed="apartment",
                notes="Relocating from Karachi. Needs apartment by end of month.",
                stage="contacted", created_at=now_offset(14)),

            Client(id=c3_id, tenant_id=tenant_id,
                full_name="Usman Tariq", phone="+923451234567",
                email="usman.tariq@yahoo.com",
                budget_min=18000000, budget_max=22000000,
                preferred_city="Islamabad", preferred_area="F-10",
                bedrooms_needed=3, property_type_needed="apartment",
                notes="Government employee, needs apartment near Secretariat.",
                stage="site_visit", created_at=now_offset(21)),

            Client(id=c4_id, tenant_id=tenant_id,
                full_name="Fatima Zahra", phone="+923211234567",
                email="fatima.zahra@gmail.com",
                budget_min=55000000, budget_max=70000000,
                preferred_city="Lahore", preferred_area="Bahria Town",
                bedrooms_needed=5, property_type_needed="house",
                notes="NRI buyer. Cash purchase. Very serious.",
                stage="negotiation", created_at=now_offset(35)),

            Client(id=c5_id, tenant_id=tenant_id,
                full_name="Zubair Hassan", phone="+923121234567",
                email="zubair.hassan@gmail.com",
                budget_min=40000000, budget_max=50000000,
                preferred_city="Lahore", preferred_area="Askari",
                bedrooms_needed=4, property_type_needed="house",
                notes="Deal closed — purchased 4-bed Askari 11 house.",
                stage="closed", created_at=now_offset(50)),
        ]
        for c in clients:
            session.add(c)
        await session.commit()
        print(f"✓ Clients: {len(clients)} added (all 5 pipeline stages)")

        # ── Interaction Logs ──────────────────────────────────────────────────
        logs = [
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c1_id, agent_id=owner_id,
                type="whatsapp", content="Client messaged asking for DHA Phase 6 options. Sent property list.",
                created_at=now_offset(6)),
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c1_id, agent_id=owner_id,
                type="whatsapp", content="Client interested in the 3-bed on Street 12. Asking for visit.",
                created_at=now_offset(5)),

            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c2_id, agent_id=agent_id,
                type="call", content="Called Ayesha. Confirmed budget PKR 14-18 Lac. Looking for 2-bed in Gulberg.",
                created_at=now_offset(13)),
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c2_id, agent_id=agent_id,
                type="email", content="Sent follow-up email with 3 shortlisted apartments in Gulberg III.",
                created_at=now_offset(12)),
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c2_id, agent_id=agent_id,
                type="whatsapp", content="Client confirmed she will visit Saturday. Sent directions.",
                created_at=now_offset(10)),

            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c3_id, agent_id=owner_id,
                type="call", content="Called Usman. Confirmed F-10 apartment shortlisted. Visit booked for Thursday.",
                created_at=now_offset(19)),
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c3_id, agent_id=owner_id,
                type="note", content="Visited F-10 apartment. Client liked the view and building. Asking for 5% discount.",
                created_at=now_offset(17)),
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c3_id, agent_id=owner_id,
                type="whatsapp", content="Told him to finalize quickly — another buyer is interested.",
                created_at=now_offset(16)),

            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c4_id, agent_id=agent_id,
                type="call", content="Fatima called from Dubai. She wants to buy Bahria Town corner house. Shared video tour.",
                created_at=now_offset(33)),
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c4_id, agent_id=agent_id,
                type="email", content="Sent legal documents and price negotiation summary. Asking 63M (down from 65M).",
                created_at=now_offset(25)),
            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c4_id, agent_id=owner_id,
                type="note", content="Negotiation ongoing. She wants 60M. Owner willing to go to 62M.",
                created_at=now_offset(18)),

            InteractionLog(id=uuid4(), tenant_id=tenant_id, client_id=c5_id, agent_id=owner_id,
                type="note", content="Deal closed at PKR 44M. Token paid. Registry scheduled next week.",
                created_at=now_offset(5)),
        ]
        for log in logs:
            session.add(log)
        await session.commit()
        print(f"✓ Interaction logs: {len(logs)} added")

        # ── Site Visit Slots ──────────────────────────────────────────────────
        base = datetime.utcnow()
        def slot_dt(days_from_now, hour):
            return (base + timedelta(days=days_from_now)).replace(hour=hour, minute=0, second=0, microsecond=0)

        slots = [
            SiteVisitSlot(id=uuid4(), tenant_id=tenant_id, agent_id=owner_id,
                slot_datetime=slot_dt(1, 10), is_booked=False),
            SiteVisitSlot(id=uuid4(), tenant_id=tenant_id, agent_id=owner_id,
                slot_datetime=slot_dt(1, 14), is_booked=True, booked_by_client_id=c2_id),
            SiteVisitSlot(id=uuid4(), tenant_id=tenant_id, agent_id=owner_id,
                slot_datetime=slot_dt(2, 10), is_booked=False),
            SiteVisitSlot(id=uuid4(), tenant_id=tenant_id, agent_id=owner_id,
                slot_datetime=slot_dt(2, 12), is_booked=True, booked_by_client_id=c3_id),
            SiteVisitSlot(id=uuid4(), tenant_id=tenant_id, agent_id=agent_id,
                slot_datetime=slot_dt(3, 11), is_booked=False),
            SiteVisitSlot(id=uuid4(), tenant_id=tenant_id, agent_id=agent_id,
                slot_datetime=slot_dt(3, 15), is_booked=False),
            SiteVisitSlot(id=uuid4(), tenant_id=tenant_id, agent_id=owner_id,
                slot_datetime=slot_dt(4, 10), is_booked=False),
        ]
        for s in slots:
            session.add(s)
        await session.commit()
        print(f"✓ Site visit slots: {len(slots)} added")

    print("\n" + "="*55)
    print("  DEMO SEED COMPLETE")
    print("="*55)
    print(f"  Login URL : http://localhost:3000/login")
    print(f"  Email     : {DEMO_EMAIL}")
    print(f"  Password  : {DEMO_PASSWORD}")
    print("="*55)


asyncio.run(seed())
