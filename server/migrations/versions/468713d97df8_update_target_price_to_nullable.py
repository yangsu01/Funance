"""update target price to nullable

Revision ID: 468713d97df8
Revises: 635634994b6e
Create Date: 2024-08-14 21:17:39.325208

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '468713d97df8'
down_revision = '635634994b6e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.alter_column('target_price',
               existing_type=sa.FLOAT(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.alter_column('target_price',
               existing_type=sa.FLOAT(),
               nullable=False)

    # ### end Alembic commands ###
