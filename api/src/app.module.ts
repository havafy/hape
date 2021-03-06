import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SearchModule } from "./search/search.module";
import { AddressModule } from "./address/address.module";
import { ProductsModule } from "./products/products.module"
import { CheckoutModule } from "./checkout/checkout.module";
import { ShopModule } from "./shop/shop.module";
import { OrdersModule } from "./orders/orders.module";
import { PagesModule } from "./pages/pages.module"
import { FilesModule } from "./files/files.module"
import { ForgotPasswordModule } from "./forgot-password/forgot-password.module";
import { ChangePasswordModule } from "./change-password/change-password.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(),
    AuthModule,
    UsersModule,
    ForgotPasswordModule,
    ChangePasswordModule,
    PagesModule,
    FilesModule,
    SearchModule, 
    CheckoutModule,
    OrdersModule,
    ProductsModule,
    ShopModule,
    AddressModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          auth: {
            user: process.env.EMAIL_AUTH_USER,
            pass: process.env.EMAIL_AUTH_PASSWORD,
          },
        },
        defaults: {
          from: '"' + process.env.EMAIL_FROM_NAME + '" <' + process.env.EMAIL_FROM + '>',
        },
        template: {
          dir: __dirname + '/../templates/emails',
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
