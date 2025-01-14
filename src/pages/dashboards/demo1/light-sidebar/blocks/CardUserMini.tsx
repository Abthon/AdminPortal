import { IAvatar } from "@/partials/cards";
import { CommonAvatar } from "@/partials/common";

interface IUserMiniProps {
  avatar?: string;
  name: string;
  phoneNumber: string;
}

const CardUserMini = ({ avatar, name, phoneNumber }: IUserMiniProps) => {
  return (
    <div className="card flex flex-col items-center p-5 lg:py-10">
      <div className="mb-3.5">
        {avatar && (
          <CommonAvatar
            className="size-20 relative"
            image={avatar}
            imageClass="rounded-full"
            fallback=""
            badgeClass="flex size-2.5 bg-success rounded-full absolute bottom-0.5 start-16 transform -translate-y-1/2"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-2">
        <a
          href="#"
          className="hover:text-primary-active text-base leading-5 font-medium text-gray-900"
        >
          {name}
        </a>
      </div>
      <a href="#" className="text-gray-700 text-sm hover:text-primary-active">
        {phoneNumber}
      </a>
    </div>
  );
};

export { CardUserMini, type IUserMiniProps };
