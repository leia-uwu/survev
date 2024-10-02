import { Fragment, h } from "jsx-dom";

export default function Language({ code }: { code: string }) {
    return (
        <>
            <a
                class="nav-link dropdown-toggle"
                href="#"
                id="selected-language"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
            >
                {code.toUpperCase()}
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                {/* @ts-expect-error use data attribute? */}
                <a class="dropdown-item dropdown-language" href="#" value="en">
                    English
                </a>
                {/* @ts-expect-error use data attribute? */}
                <a class="dropdown-item dropdown-language" href="#" value="es">
                    Español
                </a>
            </div>
        </>
    );
}
