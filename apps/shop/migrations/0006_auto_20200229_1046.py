# Generated by Django 2.2.10 on 2020-02-29 09:46

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("shop", "0005_merge_20190506_2241")]

    operations = [
        migrations.AlterField(
            model_name="orderline",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="shop_order_lines",
                to=settings.AUTH_USER_MODEL,
            ),
        )
    ]